import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBox, FaDollarSign, FaShoppingCart, FaUsers, FaTrophy, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [overviewRes, customersRes, productsRes, revenueRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders/stats/overview', config),
        axios.get('http://localhost:5000/api/orders/stats/top-customers', config),
        axios.get('http://localhost:5000/api/products/stats/best-selling', config),
        axios.get('http://localhost:5000/api/orders/stats/revenue?period=month', config)
      ]);

      setOverview(overviewRes.data);
      setTopCustomers(customersRes.data);
      setBestSelling(productsRes.data);
      setRevenue(revenueRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng đơn hàng</p>
              <p className="text-3xl font-bold">{overview?.totalOrders || 0}</p>
            </div>
            <FaShoppingCart className="text-5xl text-blue-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Doanh thu</p>
              <p className="text-3xl font-bold">
                {(overview?.totalRevenue || 0).toLocaleString()}₫
              </p>
            </div>
            <FaDollarSign className="text-5xl text-green-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Sản phẩm bán chạy</p>
              <p className="text-3xl font-bold">{bestSelling.length}</p>
            </div>
            <FaTrophy className="text-5xl text-purple-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Khách hàng</p>
              <p className="text-3xl font-bold">{topCustomers.length}</p>
            </div>
            <FaUsers className="text-5xl text-orange-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaBox className="text-blue-600" />
          Trạng thái đơn hàng
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {overview?.ordersByStatus?.map((status) => (
            <div key={status._id} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{status.count}</p>
              <p className="text-sm text-gray-600 mt-1">{status._id || 'Đang xử lý'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaUsers className="text-green-600" />
            Top 10 khách hàng
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Khách hàng</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Đơn hàng</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Tổng chi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topCustomers.map((customer, index) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                      {customer.totalSpent.toLocaleString()}₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-600" />
            Sản phẩm bán chạy
          </h3>
          <div className="space-y-3">
            {bestSelling.map((product, index) => (
              <div key={product._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-bold text-gray-500 w-8">#{index + 1}</span>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                />
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{product.totalSold} bán</p>
                  <p className="text-xs text-green-600">{product.totalRevenue.toLocaleString()}₫</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-600" />
          Doanh thu 12 tháng gần nhất
        </h3>
        <div className="space-y-2">
          {revenue.map((item, index) => {
            const monthName = item._id.month ? `Tháng ${item._id.month}/${item._id.year}` : `Năm ${item._id.year}`;
            const maxRevenue = Math.max(...revenue.map(r => r.totalRevenue));
            const widthPercent = (item.totalRevenue / maxRevenue) * 100;

            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{monthName}</span>
                  <span className="font-bold text-green-600">
                    {item.totalRevenue.toLocaleString()}₫ ({item.orderCount} đơn)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Đơn hàng gần đây</h3>
        <div className="space-y-3">
          {overview?.recentOrders?.map((order) => (
            <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800">#{order._id.slice(-8)}</p>
                <p className="text-sm text-gray-600">{order.user?.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">{order.totalPrice.toLocaleString()}₫</p>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  {order.orderStatus || 'Đang xử lý'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;