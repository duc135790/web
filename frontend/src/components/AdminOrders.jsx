import { useState, useEffect } from 'react';
import { ordersAPI } from '../utils/api';
import { FaBox, FaPhone, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      alert('✅ Cập nhật trạng thái thành công!');
      setEditingOrderId(null);
      fetchOrders();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Đã xác nhận':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Đang giao':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Đã giao':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.orderStatus === filterStatus || (!order.orderStatus && filterStatus === 'Đang xử lý');
  });

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Danh sách đơn hàng</h2>
          <p className="text-sm text-gray-600 mt-1">
            Hiển thị {filteredOrders.length}/{orders.length} đơn hàng
          </p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border-2 border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Đang xử lý">Đang xử lý</option>
          <option value="Đã xác nhận">Đã xác nhận</option>
          <option value="Đang giao">Đang giao</option>
          <option value="Đã giao">Đã giao</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaBox className="text-blue-600 text-xl" />
                    <h3 className="font-bold text-lg">Đơn hàng #{order._id.slice(-6)}</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Khách hàng: <span className="font-medium">{order.user?.name || order.user?.email || 'N/A'}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {editingOrderId === order._id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="border-2 border-blue-500 rounded-md px-3 py-2 text-sm focus:outline-none"
                      >
                        <option value="">Chọn trạng thái</option>
                        <option value="Đang xử lý">Đang xử lý</option>
                        <option value="Đã xác nhận">Đã xác nhận</option>
                        <option value="Đang giao">Đang giao</option>
                        <option value="Đã giao">Đã giao</option>
                        <option value="Đã hủy">Đã hủy</option>
                      </select>
                      <button
                        onClick={() => handleUpdateStatus(order._id, newStatus)}
                        disabled={!newStatus}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => {
                          setEditingOrderId(null);
                          setNewStatus('');
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm font-semibold"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus || 'Đang xử lý')}`}>
                        {order.orderStatus || 'Đang xử lý'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingOrderId(order._id);
                          setNewStatus(order.orderStatus || 'Đang xử lý');
                        }}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Cập nhật trạng thái"
                      >
                        <FaEdit className="text-xl" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Order Items */}
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Sản phẩm:</h4>
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} ₫
                    </span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Tổng:</span>
                  <span className="text-red-600">{order.totalPrice.toLocaleString()} ₫</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-600" />
                    Thông tin giao hàng:
                  </p>
                  <p className="text-gray-700">
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaPhone className="text-green-600" />
                    Số điện thoại:
                  </p>
                  <p className="text-gray-700">{order.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 p-3 bg-yellow-50 rounded text-sm">
                <p className="text-gray-700">
                  <strong>Thanh toán:</strong> {order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}
                  {' | '}
                  <strong>Trạng thái:</strong> {order.isPaid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">Không có đơn hàng nào</p>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;