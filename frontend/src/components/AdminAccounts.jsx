import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminAccounts = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, admin, user
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('http://localhost:5000/api/customers/all', config);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Nếu API chưa có, dùng mock data
      setCustomers([
        {
          _id: '1',
          name: 'Admin User',
          email: 'admin@bookstore.com',
          phone: '0901234567',
          isAdmin: true,
          isActive: true,
          createdAt: new Date('2024-01-01'),
          totalOrders: 0,
          totalSpent: 0
        },
        {
          _id: '2',
          name: 'Nguyễn Văn A',
          email: 'user1@example.com',
          phone: '0909876543',
          isAdmin: false,
          isActive: true,
          createdAt: new Date('2024-02-15'),
          totalOrders: 5,
          totalSpent: 1500000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (customerId, currentStatus) => {
    const action = currentStatus ? 'gỡ quyền admin' : 'cấp quyền admin';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} cho người dùng này?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/customers/${customerId}/toggle-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Đã ${action} thành công!`);
      fetchCustomers();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleActive = async (customerId, currentStatus) => {
    const action = currentStatus ? 'vô hiệu hóa' : 'kích hoạt';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/customers/${customerId}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Đã ${action} tài khoản thành công!`);
      fetchCustomers();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesType = filterType === 'all' || 
                       (filterType === 'admin' && customer.isAdmin) ||
                       (filterType === 'user' && !customer.isAdmin);
    
    const matchesSearch = !searchTerm || 
                         customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Quản lý tài khoản</h2>
          <p className="text-sm text-gray-600 mt-1">
            Hiển thị {filteredCustomers.length}/{customers.length} tài khoản
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-2 border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border-2 border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="admin">Admin</option>
            <option value="user">Người dùng</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thông tin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thống kê</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quyền hạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className={!customer.isActive ? 'bg-gray-50 opacity-60' : ''}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          Tham gia: {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center text-gray-700">
                        <FaEnvelope className="mr-2 text-gray-400" size={12} />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center text-gray-700">
                          <FaPhone className="mr-2 text-gray-400" size={12} />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      <div className="text-gray-700">
                        Đơn hàng: <span className="font-semibold">{customer.totalOrders || 0}</span>
                      </div>
                      <div className="text-green-600 font-semibold">
                        {(customer.totalSpent || 0).toLocaleString()}₫
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.isAdmin 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.isAdmin ? (
                        <><FaShieldAlt className="mr-1" /> Admin</>
                      ) : (
                        <><FaUser className="mr-1" /> User</>
                      )}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.isActive !== false
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.isActive !== false ? '✓ Hoạt động' : '✗ Vô hiệu'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleToggleAdmin(customer._id, customer.isAdmin)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        customer.isAdmin
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                      title={customer.isAdmin ? 'Gỡ quyền admin' : 'Cấp quyền admin'}
                    >
                      {customer.isAdmin ? 'Gỡ Admin' : 'Cấp Admin'}
                    </button>
                    
                    <button
                      onClick={() => handleToggleActive(customer._id, customer.isActive !== false)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        customer.isActive !== false
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={customer.isActive !== false ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    >
                      {customer.isActive !== false ? (
                        <><FaEyeSlash className="inline mr-1" />Vô hiệu</>
                      ) : (
                        <><FaEye className="inline mr-1" />Kích hoạt</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-4">
          <p className="text-gray-600">Không tìm thấy tài khoản nào</p>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;