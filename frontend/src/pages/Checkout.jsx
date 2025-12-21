import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI, ordersAPI } from '../utils/api';
import { FaMapMarkerAlt, FaCreditCard, FaShoppingBag, FaCheckCircle } from 'react-icons/fa';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Thông tin, 2: Xác nhận, 3: Hoàn thành

  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      if (response.data.length === 0) {
        navigate('/cart');
        return;
      }
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep1()) return;

    // ✅ KIỂM TRA TỒN KHO TRƯỚC KHI ĐẶT HÀNG
    const outOfStockItems = cartItems.filter(item => {
      const stock = item.product?.countInStock || 0;
      return stock === 0 || item.quantity > stock;
    });

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.product?.name || item.name).join(', ');
      alert(`❌ Một số sản phẩm đã hết hàng hoặc không đủ số lượng: ${itemNames}\n\nVui lòng kiểm tra lại giỏ hàng.`);
      navigate('/cart');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        shippingAddress: {
          address: shippingInfo.address,
          city: shippingInfo.city,
          phone: shippingInfo.phone
        },
        paymentMethod: paymentMethod,
        totalPrice: calculateTotal()
      };

      const response = await ordersAPI.createOrder(orderData);
      console.log('✅ Order created:', response.data);
      
      setStep(3);
      
      // Auto redirect sau 5 giây
      setTimeout(() => {
        navigate('/my-orders');
      }, 5000);
    } catch (error) {
      console.error('❌ Error creating order:', error);
      alert(error.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Step 3: Hoàn thành
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <FaCheckCircle className="text-6xl text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">🎉 Đặt hàng thành công!</h2>
            <p className="text-gray-600 text-lg">
              Cảm ơn bạn đã tin tưởng BookStore. Đơn hàng của bạn đang được xử lý.
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  Thông tin giao hàng
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Người nhận:</strong> {shippingInfo.name}</p>
                  <p><strong>SĐT:</strong> {shippingInfo.phone}</p>
                  <p><strong>Địa chỉ:</strong> {shippingInfo.address}, {shippingInfo.city}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaCreditCard className="text-green-600" />
                  Thông tin thanh toán
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Phương thức:</strong> {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</p>
                  <p><strong>Số sản phẩm:</strong> {cartItems.length} sản phẩm</p>
                  <p className="text-2xl font-bold text-red-600 mt-3">
                    {calculateTotal().toLocaleString()}₫
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaShoppingBag className="text-purple-600" />
              Sản phẩm đã đặt
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.product._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.product.image || item.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-sm line-clamp-1">{item.product.name || item.name}</p>
                    <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {((item.price || item.product.price) * item.quantity).toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <h4 className="font-bold text-gray-800 mb-2">📦 Bước tiếp theo:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng 1 giờ</li>
              <li>✓ Đơn hàng sẽ được giao trong 2-3 ngày làm việc</li>
              <li>✓ Bạn có thể theo dõi đơn hàng tại trang "Đơn hàng của tôi"</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/my-orders')}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Xem đơn hàng của tôi
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Thanh toán</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-300'} font-bold`}>
                1
              </div>
              <span className="ml-2 font-semibold hidden sm:inline">Thông tin</span>
            </div>
            
            <div className={`w-16 sm:w-24 h-1 mx-2 ${step >= 2 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-300'} font-bold`}>
                2
              </div>
              <span className="ml-2 font-semibold hidden sm:inline">Xác nhận</span>
            </div>
            
            <div className={`w-16 sm:w-24 h-1 mx-2 ${step >= 3 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${step >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-300'} font-bold`}>
                3
              </div>
              <span className="ml-2 font-semibold hidden sm:inline">Hoàn thành</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-6">
                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-600" />
                    Thông tin giao hàng
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ tên <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Số nhà, tên đường"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Chọn</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quận/Huyện
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={shippingInfo.district}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phường/Xã
                      </label>
                      <input
                        type="text"
                        name="ward"
                        value={shippingInfo.ward}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      name="notes"
                      value={shippingInfo.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaCreditCard className="text-red-600" />
                    Phương thức thanh toán
                  </h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-semibold">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors opacity-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="BANK"
                        disabled
                        className="mr-3"
                      />
                      <div>
                        <p className="font-semibold">Chuyển khoản ngân hàng</p>
                        <p className="text-sm text-gray-600">Sắp ra mắt</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FaShoppingBag className="text-red-600" />
                  Xác nhận đơn hàng
                </h2>

                {/* Shipping Info Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Thông tin giao hàng</h3>
                  <div className="text-sm space-y-1 text-gray-700">
                    <p><strong>Người nhận:</strong> {shippingInfo.name}</p>
                    <p><strong>Điện thoại:</strong> {shippingInfo.phone}</p>
                    <p><strong>Địa chỉ:</strong> {shippingInfo.address}, {shippingInfo.city}</p>
                    {shippingInfo.notes && <p><strong>Ghi chú:</strong> {shippingInfo.notes}</p>}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Sản phẩm đã chọn</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.product._id} className="flex gap-3 p-3 border border-gray-200 rounded">
                        <img
                          src={item.product.image || item.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-grow">
                          <p className="font-medium text-sm">{item.product.name || item.name}</p>
                          <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            {((item.price || item.product.price) * item.quantity).toLocaleString()}₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Phương thức thanh toán:</strong> {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Quay lại
                </button>
              )}
              
              {step === 1 && (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Tiếp tục
                </button>
              )}
              
              {step === 2 && (
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span className="font-semibold">{calculateTotal().toLocaleString()}₫</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-semibold">Miễn phí</span>
                </div>
                
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{calculateTotal().toLocaleString()}₫</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Lưu ý:</strong> Đơn hàng sẽ được giao trong vòng 2-3 ngày làm việc
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;