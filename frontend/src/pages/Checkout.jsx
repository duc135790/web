import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI, ordersAPI, vouchersAPI } from '../utils/api';
import { FaMapMarkerAlt, FaCreditCard, FaShoppingBag, FaCheckCircle, FaTag, FaTimes, FaGift, FaUniversity } from 'react-icons/fa';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // Voucher states
  const [vouchers, setVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [showVouchers, setShowVouchers] = useState(false);

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
  
  // Bank transfer info
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    transferNote: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
    fetchVouchers();
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

  const fetchVouchers = async () => {
    try {
      const response = await vouchersAPI.getActiveVouchers();
      setVouchers(response.data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShippingFee = () => {
    return appliedVoucher?.type === 'shipping' ? 0 : 30000;
  };

  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;
    
    const subtotal = calculateSubtotal();
    
    if (appliedVoucher.type === 'fixed') {
      return appliedVoucher.discount;
    } else if (appliedVoucher.type === 'percent') {
      return Math.round(subtotal * appliedVoucher.discount / 100);
    } else if (appliedVoucher.type === 'shipping') {
      return 30000;
    }
    return 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShippingFee() - calculateDiscount();
  };

  const handleApplyVoucher = async (voucher) => {
    try {
      const response = await vouchersAPI.applyVoucher(voucher.code, calculateSubtotal());
      setAppliedVoucher(response.data.voucher);
      setVoucherInput(response.data.voucher.code);
      setVoucherError('');
      setShowVouchers(false);
    } catch (error) {
      setVoucherError(error.response?.data?.message || 'Không thể áp dụng voucher');
    }
  };

  const handleApplyVoucherInput = async () => {
    if (!voucherInput.trim()) {
      setVoucherError('Vui lòng nhập mã voucher');
      return;
    }
    
    try {
      const response = await vouchersAPI.applyVoucher(voucherInput, calculateSubtotal());
      setAppliedVoucher(response.data.voucher);
      setVoucherError('');
      setShowVouchers(false);
    } catch (error) {
      setVoucherError(error.response?.data?.message || 'Mã voucher không hợp lệ');
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError('');
  };

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleBankInfoChange = (e) => {
    setBankInfo({
      ...bankInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return false;
    }
    
    if (paymentMethod === 'BANK') {
      if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) {
        alert('Vui lòng điền đầy đủ thông tin chuyển khoản');
        return false;
      }
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

    setSubmitting(true);
    try {
      const orderData = {
        shippingAddress: {
          address: shippingInfo.address,
          city: shippingInfo.city,
          phone: shippingInfo.phone
        },
        paymentMethod: paymentMethod,
        totalPrice: calculateTotal(),
        voucherCode: appliedVoucher?.code || null,
        discountAmount: calculateDiscount(),
        bankTransferInfo: paymentMethod === 'BANK' ? bankInfo : null
      };

      const response = await ordersAPI.createOrder(orderData);
      console.log('✅ Order created:', response.data);
      
      if (appliedVoucher) {
        try {
          await vouchersAPI.useVoucher(appliedVoucher._id);
        } catch (error) {
          console.error('Error updating voucher usage:', error);
        }
      }
      
      setStep(3);
      
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

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <FaCheckCircle className="text-6xl text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">🎉 Đặt hàng thành công!</h2>
            <p className="text-gray-600 text-lg">
              Cảm ơn bạn đã tin tưởng BookStore.
            </p>
          </div>

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
                  Thanh toán
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Phương thức:</strong> {paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</p>
                  {paymentMethod === 'BANK' && (
                    <>
                      <p><strong>Ngân hàng:</strong> {bankInfo.bankName}</p>
                      <p><strong>STK:</strong> {bankInfo.accountNumber}</p>
                      <p><strong>Chủ TK:</strong> {bankInfo.accountHolder}</p>
                    </>
                  )}
                  {appliedVoucher && (
                    <p className="text-green-600"><strong>Voucher:</strong> {appliedVoucher.code} (-{calculateDiscount().toLocaleString()}₫)</p>
                  )}
                  <p className="text-2xl font-bold text-red-600 mt-3">
                    {calculateTotal().toLocaleString()}₫
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate('/my-orders')} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              Xem đơn hàng
            </button>
            <button onClick={() => navigate('/products')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              Tiếp tục mua
            </button>
          </div>
        </div>
      </div>
    );
  }
// Tiếp theo từ phần 1 - phần return chính
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Thanh toán</h1>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-300'} font-bold`}>1</div>
              <span className="ml-2 font-semibold hidden sm:inline">Thông tin</span>
            </div>
            <div className={`w-16 sm:w-24 h-1 mx-2 ${step >= 2 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-300'} font-bold`}>2</div>
              <span className="ml-2 font-semibold hidden sm:inline">Xác nhận</span>
            </div>
            <div className={`w-16 sm:w-24 h-1 mx-2 ${step >= 3 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-300'} font-bold`}>3</div>
              <span className="ml-2 font-semibold hidden sm:inline">Hoàn thành</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-6">
                {/* Thông tin giao hàng */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-600" />
                    Thông tin giao hàng
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
                      <input type="text" name="name" value={shippingInfo.name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                      <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
                    <input type="text" name="address" value={shippingInfo.address} onChange={handleInputChange} required placeholder="Số nhà, tên đường" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/TP *</label>
                      <select name="city" value={shippingInfo.city} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Chọn</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                      <input type="text" name="district" value={shippingInfo.district} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
                      <input type="text" name="ward" value={shippingInfo.ward} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                    <textarea name="notes" value={shippingInfo.notes} onChange={handleInputChange} rows="3" placeholder="Ghi chú về đơn hàng" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"></textarea>
                  </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaCreditCard className="text-red-600" />
                    Phương thức thanh toán
                  </h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                      <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                      <div>
                        <p className="font-semibold">💵 Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                      <input type="radio" name="paymentMethod" value="BANK" checked={paymentMethod === 'BANK'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                      <div>
                        <p className="font-semibold">🏦 Chuyển khoản ngân hàng</p>
                        <p className="text-sm text-gray-600">Chuyển khoản qua số tài khoản</p>
                      </div>
                    </label>
                  </div>

                  {/* Form thông tin chuyển khoản */}
                  {paymentMethod === 'BANK' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FaUniversity className="text-blue-600" />
                        Thông tin chuyển khoản
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng *</label>
                          <select
                            name="bankName"
                            value={bankInfo.bankName}
                            onChange={handleBankInfoChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Chọn ngân hàng</option>
                            <option value="Vietcombank">Vietcombank</option>
                            <option value="VietinBank">VietinBank</option>
                            <option value="BIDV">BIDV</option>
                            <option value="Agribank">Agribank</option>
                            <option value="Techcombank">Techcombank</option>
                            <option value="MB Bank">MB Bank</option>
                            <option value="ACB">ACB</option>
                            <option value="VPBank">VPBank</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản *</label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={bankInfo.accountNumber}
                            onChange={handleBankInfoChange}
                            required
                            placeholder="Nhập số tài khoản"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chủ tài khoản *</label>
                          <input
                            type="text"
                            name="accountHolder"
                            value={bankInfo.accountHolder}
                            onChange={handleBankInfoChange}
                            required
                            placeholder="Nhập tên chủ tài khoản"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chuyển khoản</label>
                          <input
                            type="text"
                            name="transferNote"
                            value={bankInfo.transferNote}
                            onChange={handleBankInfoChange}
                            placeholder="VD: DH123456"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-yellow-50 rounded text-xs text-yellow-800">
                        ⚠️ Vui lòng chuyển khoản đúng số tiền và ghi đúng nội dung để được xử lý nhanh nhất
                      </div>
                    </div>
                  )}
                </div>

                {/* Voucher Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <FaTag className="text-orange-600" />
                      Mã giảm giá
                    </h3>
                    <button
                      onClick={() => setShowVouchers(!showVouchers)}
                      className="text-sm text-blue-600 hover:underline font-semibold"
                    >
                      {showVouchers ? 'Ẩn voucher' : 'Hiện voucher'}
                    </button>
                  </div>

                  {appliedVoucher ? (
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaGift className="text-green-600 text-2xl" />
                        <div>
                          <p className="font-bold text-green-800">{appliedVoucher.code}</p>
                          <p className="text-sm text-green-700">{appliedVoucher.description}</p>
                          <p className="text-xs text-green-600 mt-1">Giảm: {calculateDiscount().toLocaleString()}₫</p>
                        </div>
                      </div>
                      <button onClick={removeVoucher} className="text-red-600 hover:text-red-800">
                        <FaTimes className="text-xl" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={voucherInput}
                          onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                          placeholder="Nhập mã voucher"
                          className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                        />
                        <button 
                          onClick={handleApplyVoucherInput}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                        >
                          Áp dụng
                        </button>
                      </div>

                      {voucherError && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm text-red-700">
                          {voucherError}
                        </div>
                      )}

                      {showVouchers && (
                        <div className="mt-4 space-y-2">
                          {vouchers.map(voucher => (
                            <div 
                              key={voucher._id}
                              className="border-2 border-dashed border-orange-300 rounded-lg p-4 hover:bg-orange-50 cursor-pointer transition-colors"
                              onClick={() => handleApplyVoucher(voucher)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-orange-100 p-2 rounded">
                                    <FaTag className="text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-orange-800">{voucher.code}</p>
                                    <p className="text-sm text-gray-600">{voucher.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Còn {voucher.maxUses - voucher.usedCount} lượt
                                    </p>
                                  </div>
                                </div>
                                <button className="bg-orange-600 text-white px-4 py-1 rounded text-sm font-semibold hover:bg-orange-700">
                                  Áp dụng
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 - Xác nhận */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FaShoppingBag className="text-red-600" />
                  Xác nhận đơn hàng
                </h2>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Thông tin giao hàng</h3>
                  <div className="text-sm space-y-1 text-gray-700">
                    <p><strong>Người nhận:</strong> {shippingInfo.name}</p>
                    <p><strong>SĐT:</strong> {shippingInfo.phone}</p>
                    <p><strong>Địa chỉ:</strong> {shippingInfo.address}, {shippingInfo.city}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Sản phẩm</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.product._id} className="flex gap-3 p-3 border rounded">
                        <img src={item.product.image || item.image} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-grow">
                          <p className="font-medium text-sm">{item.product.name || item.name}</p>
                          <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{((item.price || item.product.price) * item.quantity).toLocaleString()}₫</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700"><strong>Thanh toán:</strong> {paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</p>
                  {paymentMethod === 'BANK' && (
                    <p className="text-sm text-gray-700 mt-1"><strong>Ngân hàng:</strong> {bankInfo.bankName} - {bankInfo.accountNumber}</p>
                  )}
                  {appliedVoucher && (
                    <p className="text-sm text-green-700 mt-1"><strong>Voucher:</strong> {appliedVoucher.code} (Giảm {calculateDiscount().toLocaleString()}₫)</p>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              {step > 1 && <button onClick={handleBack} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Quay lại</button>}
              {step === 1 && <button onClick={handleNext} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700">Tiếp tục</button>}
              {step === 2 && <button onClick={handleSubmitOrder} disabled={submitting} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">{submitting ? 'Đang xử lý...' : 'Đặt hàng'}</button>}
            </div>
          </div>

          {/* Sidebar - Tóm tắt */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({cartItems.length})</span>
                  <span className="font-semibold">{calculateSubtotal().toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className={`font-semibold ${calculateShippingFee() === 0 ? 'text-green-600' : ''}`}>
                    {calculateShippingFee() === 0 ? 'Miễn phí' : `${calculateShippingFee().toLocaleString()}₫`}
                  </span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <FaTag />
                      Giảm giá
                    </span>
                    <span className="font-semibold">-{calculateDiscount().toLocaleString()}₫</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng</span>
                  <span className="text-red-600">{calculateTotal().toLocaleString()}₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;