import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI, ordersAPI } from '../utils/api';
import { FaShoppingCart, FaTrash, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartAPI.updateCartItem(productId, newQuantity);
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }
    try {
      await cartAPI.removeFromCart(productId);
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleChange = (e) => {
    setOrderData({
      ...orderData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await ordersAPI.createOrder(orderData);
      await cartAPI.clearCart();
      alert('Đặt hàng thành công!');
      navigate('/my-orders');
    } catch (error) {
      setError(error.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-xl font-medium mb-2">Giỏ hàng trống</p>
          <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng!</p>
          <Link
            to="/products"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600 text-lg">
            Bạn có {cart.items.length} sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId._id}
                className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6 animate-fadeIn card-hover"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  {item.productId.image ? (
                    <img
                      src={item.productId.image}
                      alt={item.productId.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <FaMobileAlt className="text-white text-3xl opacity-50" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <Link
                    to={`/products/${item.productId._id}`}
                    className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    {item.productId.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{item.productId.brand}</p>
                  <p className="text-xl font-bold text-blue-600 mt-2">
                    {item.productId.price.toLocaleString()} ₫
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                    className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.productId._id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <FaTrash className="text-xl" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Thông tin đặt hàng</h2>

              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                <p className="text-3xl font-bold text-blue-600">
                  {cart.totalPrice.toLocaleString()} ₫
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={orderData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={orderData.customerPhone}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ giao hàng
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={orderData.shippingAddress}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all resize-none"
                    placeholder="Nhập địa chỉ giao hàng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    name="notes"
                    value={orderData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all resize-none"
                    placeholder="Ghi chú thêm..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="spinner mr-2" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    <>
                      <FaCheckCircle className="inline mr-2" />
                      Đặt hàng ngay
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;