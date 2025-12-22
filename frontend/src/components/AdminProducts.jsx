import { useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';
import { FaPlus, FaEdit, FaEye, FaEyeSlash, FaSearch } from 'react-icons/fa';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState(''); // ✅ SEARCH STATE
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    countInStock: '',
    image: '',
    author: '',
    publisher: '',
    publicationYear: '',
    pageCount: '',
    language: 'Tiếng Việt'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct._id, formData);
        alert('✅ Cập nhật sản phẩm thành công!');
      } else {
        await productsAPI.createProduct(formData);
        alert('✅ Thêm sản phẩm thành công!');
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category || product.brand,
      description: product.description || '',
      countInStock: product.countInStock || product.stock,
      image: product.image || '',
      author: product.author || '',
      publisher: product.publisher || '',
      publicationYear: product.publicationYear || '',
      pageCount: product.pageCount || '',
      language: product.language || 'Tiếng Việt'
    });
    setShowModal(true);
  };

  const handleToggleVisibility = async (id, currentStatus) => {
    const action = currentStatus ? 'hiển thị' : 'ẩn';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} sản phẩm này?`)) return;
    
    try {
      await productsAPI.toggleVisibility(id);
      alert(`✅ Đã ${action} sản phẩm thành công!`);
      fetchProducts();
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      countInStock: '',
      image: '',
      author: '',
      publisher: '',
      publicationYear: '',
      pageCount: '',
      language: 'Tiếng Việt'
    });
  };

  // ✅ LỌC SẢN PHẨM THEO TRẠNG THÁI VÀ TÌM KIẾM
  const filteredProducts = products.filter(product => {
    // Filter by status
    if (filterStatus === 'visible' && product.isHidden) return false;
    if (filterStatus === 'hidden' && !product.isHidden) return false;
    
    // ✅ Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      return (
        product.name?.toLowerCase().includes(search) ||
        product.author?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Danh sách sản phẩm</h2>
          <p className="text-sm text-gray-600 mt-1">
            Hiển thị {filteredProducts.length}/{products.length} sản phẩm
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          {/* ✅ SEARCH INPUT */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên sách, tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border-2 border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đã ẩn</option>
          </select>
          
          <button
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
          >
            <FaPlus />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* ✅ HIỂN THỊ THÔNG BÁO KHI TÌM KIẾM */}
      {searchTerm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-blue-700">
            <FaSearch className="inline mr-2" />
            Tìm kiếm: "<strong>{searchTerm}</strong>" - {filteredProducts.length} kết quả
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sách</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thể loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className={product.isHidden ? 'bg-gray-50 opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-12 w-12 rounded object-cover"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.author && (
                          <div className="text-xs text-gray-500">{product.author}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category || product.brand}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                    {product.price.toLocaleString()}₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      (product.countInStock || product.stock) > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.countInStock || product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isHidden 
                        ? 'bg-gray-200 text-gray-700' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.isHidden ? '👁️‍🗨️ Đã ẩn' : '👁️ Hiển thị'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 p-2"
                      title="Chỉnh sửa"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(product._id, product.isHidden)}
                      className={`p-2 ${
                        product.isHidden 
                          ? 'text-green-600 hover:text-green-900' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title={product.isHidden ? 'Hiển thị' : 'Ẩn'}
                    >
                      {product.isHidden ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ THÔNG BÁO KHI KHÔNG TÌM THẤY */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-4">
          <p className="text-gray-600">
            {searchTerm 
              ? `Không tìm thấy sản phẩm với từ khóa "${searchTerm}"` 
              : 'Không có sản phẩm nào'}
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="">Chọn thể loại</option>
                    <option value="Văn học">Văn học</option>
                    <option value="Kinh tế">Kinh tế</option>
                    <option value="Kỹ năng sống">Kỹ năng sống</option>
                    <option value="Thiếu nhi">Thiếu nhi</option>
                    <option value="Giáo khoa">Giáo khoa</option>
                    <option value="Ngoại ngữ">Ngoại ngữ</option>
                    <option value="Lịch sử">Lịch sử</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (₫) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho *</label>
                  <input type="number" name="countInStock" value={formData.countInStock} onChange={handleChange} required min="0" className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                <input type="url" name="image" value={formData.image} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                  <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà xuất bản</label>
                  <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm XB</label>
                  <input type="number" name="publicationYear" value={formData.publicationYear} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số trang</label>
                  <input type="number" name="pageCount" value={formData.pageCount} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ</label>
                  <input type="text" name="language" value={formData.language} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  {editingProduct ? 'Cập nhật' : 'Thêm'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); resetForm(); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;