import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, cartAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FaMobileAlt, FaShoppingCart, FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaBox, FaMemory, FaBatteryFull } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getProductById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setError('');
    setSuccess('');
    setAddingToCart(true);

    try {
      await cartAPI.addToCart(id, quantity);
      setSuccess('Đã thêm vào giỏ hàng!');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Thêm vào giỏ hàng thất bại');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await cartAPI.addToCart(id, quantity);
      navigate('/cart');
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-xl">Không tìm thấy sản phẩm</p>
          <Link
            to="/products"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors animate-fadeIn"
        >
          <FaArrowLeft />
          <span>Quay lại danh sách sản phẩm</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 animate-fadeIn">
          {/* Product Image */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-contain"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center rounded-xl">
                <FaMobileAlt className="text-white text-8xl opacity-50" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-4">
                <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-3">
                  {product.brand}
                </span>
                <h1 className="text-3xl font-bold mb-2 text-gray-800">
                  {product.name}
                </h1>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  product.inStock
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.inStock ? '✓ Còn hàng' : '✗ Hết hàng'}
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                {product.description || 'Sản phẩm chính hãng, nguyên seal'}
              </p>

              {/* Specifications */}
              {product.specs && (
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  {product.specs.ram && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FaMemory className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">RAM</p>
                        <p className="font-bold text-gray-800">{product.specs.ram}</p>
                      </div>
                    </div>
                  )}
                  {product.specs.storage && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <FaBox className="text-purple-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bộ nhớ</p>
                        <p className="font-bold text-gray-800">{product.specs.storage}</p>
                      </div>
                    </div>
                  )}
                  {product.specs.battery && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <FaBatteryFull className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pin</p>
                        <p className="font-bold text-gray-800">{product.specs.battery}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <FaBox className="text-orange-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kho</p>
                      <p className="font-bold text-gray-800">{product.stock} sản phẩm</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
                <p className="text-sm text-gray-600 mb-1">Giá bán</p>
                <p className="text-4xl font-bold text-blue-600">
                  {product.price.toLocaleString()} ₫
                </p>
              </div>

              {/* Messages */}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4 animate-slideIn">
                  <div className="flex items-center space-x-2">
                    <FaCheckCircle />
                    <p className="font-medium">{success}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4 animate-slideIn">
                  <div className="flex items-center space-x-2">
                    <FaExclamationCircle />
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stock}
                    className="w-32 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all input-focus"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || !user || addingToCart}
                    className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? (
                      <span className="flex items-center justify-center">
                        <div className="spinner mr-2" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                        Đang thêm...
                      </span>
                    ) : (
                      <>
                        <FaShoppingCart className="inline mr-2" />
                        Thêm vào giỏ
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock || !user}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {user ? 'Mua ngay' : 'Đăng nhập để mua'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;