import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { FaMobileAlt, FaSearch, FaShoppingCart } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('brand') || '');

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts(filter || null);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value) {
      setSearchParams({ brand: value });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Khám phá sản phẩm
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tìm chiếc điện thoại hoàn hảo cho bạn
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8 flex justify-center animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg p-4 inline-flex items-center space-x-4">
            <FaSearch className="text-blue-600 text-xl" />
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border-0 bg-transparent text-gray-700 font-medium focus:outline-none focus:ring-0 cursor-pointer text-lg"
            >
              <option value="">Tất cả thương hiệu</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="OPPO">OPPO</option>
              <option value="Vivo">Vivo</option>
              <option value="Realme">Realme</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <FaMobileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl">Không có sản phẩm nào</p>
            <p className="text-gray-500 mt-2">Vui lòng thử lại sau hoặc chọn thương hiệu khác</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-64 overflow-hidden bg-gray-50">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <FaMobileAlt className="text-white text-6xl opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                    <span className="text-sm font-semibold text-blue-600">{product.brand}</span>
                  </div>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Hết hàng
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800 line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                    {product.description || 'Sản phẩm chính hãng'}
                  </p>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-gray-500">Giá bán</p>
                      <p className="font-bold text-xl text-blue-600">
                        {product.price.toLocaleString()} ₫
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Còn lại</p>
                      <p className="font-semibold text-gray-800">{product.stock}</p>
                    </div>
                  </div>
                  <Link
                    to={`/products/${product._id}`}
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaShoppingCart className="inline mr-2" />
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;