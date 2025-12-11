import { useState, useEffect } from 'react';
import { ordersAPI } from '../utils/api';
import { FaBox, FaTimes, FaPhone, FaMapMarkerAlt, FaMobileAlt } from 'react-icons/fa';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      await ordersAPI.cancelOrder(id);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Hủy đơn hàng thất bại');
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Đơn hàng của tôi
          </h1>
          <p className="text-gray-600 text-lg">Quản lý và theo dõi các đơn hàng của bạn</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg animate-fadeIn">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-medium mb-2">Bạn chưa có đơn hàng nào</p>
            <p className="text-gray-500">Hãy khám phá và mua sắm ngay hôm nay!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 card-hover animate-fadeIn overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                          <FaBox className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Đơn hàng #{order._id.slice(-6)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Sản phẩm:</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                            {item.productId?.image ? (
                              <img
                                src={item.productId.image}
                                alt={item.productId.name}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <FaMobileAlt className="text-white text-2xl opacity-50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.productId?.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.price.toLocaleString()} ₫ x {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-blue-600">
                            {(item.price * item.quantity).toLocaleString()} ₫
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Thông tin người nhận:</p>
                      <div className="space-y-1">
                        <p className="text-gray-700 font-medium">{order.customerName}</p>
                        <p className="text-gray-600 text-sm flex items-center">
                          <FaPhone className="mr-2 text-blue-600" />
                          {order.customerPhone}
                        </p>
                        <p className="text-gray-600 text-sm flex items-start">
                          <FaMapMarkerAlt className="mr-2 text-blue-600 mt-1 flex-shrink-0" />
                          <span>{order.shippingAddress}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Tổng thanh toán:</p>
                      <p className="text-3xl font-bold text-green-600">
                        {order.totalPrice.toLocaleString()} ₫
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Ghi chú:</p>
                      <p className="text-gray-600">{order.notes}</p>
                    </div>
                  )}

                  {order.status === 'Đang xử lý' && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      className="w-full md:w-auto bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 flex items-center justify-center space-x-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaTimes />
                      <span>Hủy đơn hàng</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;