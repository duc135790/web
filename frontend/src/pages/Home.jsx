import { Link } from 'react-router-dom';
import { FaMobileAlt, FaShoppingCart, FaBox, FaStar, FaTruck, FaShieldAlt, FaHeadset } from 'react-icons/fa';

const Home = () => {
  const brands = [
    { name: 'Apple', icon: '🍎' },
    { name: 'Samsung', icon: '📱' },
    { name: 'Xiaomi', icon: '⚡' },
    { name: 'OPPO', icon: '💎' },
    { name: 'Vivo', icon: '🌟' },
    { name: 'Realme', icon: '🚀' },
  ];

  const features = [
    {
      icon: <FaTruck className="text-4xl text-blue-600" />,
      title: 'Giao hàng nhanh',
      description: 'Miễn phí vận chuyển cho đơn hàng trên 5 triệu',
    },
    {
      icon: <FaShieldAlt className="text-4xl text-green-600" />,
      title: 'Bảo hành chính hãng',
      description: 'Bảo hành 12 tháng, đổi trả trong 7 ngày',
    },
    {
      icon: <FaHeadset className="text-4xl text-purple-600" />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ tư vấn nhiệt tình, chuyên nghiệp',
    },
    {
      icon: <FaStar className="text-4xl text-yellow-500" />,
      title: 'Sản phẩm chính hãng',
      description: '100% hàng chính hãng, nguyên seal',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl mb-6 shadow-2xl">
              <FaMobileAlt className="text-4xl" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Chào mừng đến với
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Phone Store
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Điện thoại chính hãng - Giá tốt nhất thị trường
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-xl transform hover:scale-105"
              >
                <FaShoppingCart className="mr-2" />
                Mua sắm ngay
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Đăng ký tài khoản
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Thương hiệu nổi bật
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brands.map((brand, index) => (
              <Link
                key={brand.name}
                to={`/products?brand=${brand.name}`}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 card-hover animate-fadeIn border-2 border-transparent hover:border-blue-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {brand.icon}
                  </div>
                  <p className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                    {brand.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Tại sao chọn chúng tôi?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover animate-fadeIn text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <FaBox className="text-6xl mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sẵn sàng mua sắm?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Khám phá hàng ngàn sản phẩm điện thoại chính hãng với giá tốt nhất
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-xl transform hover:scale-105"
            >
              <FaMobileAlt className="mr-2" />
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fadeIn">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">1000+</div>
              <p className="text-gray-600 font-medium">Sản phẩm</p>
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">5000+</div>
              <p className="text-gray-600 font-medium">Khách hàng</p>
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">99%</div>
              <p className="text-gray-600 font-medium">Hài lòng</p>
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">24/7</div>
              <p className="text-gray-600 font-medium">Hỗ trợ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;