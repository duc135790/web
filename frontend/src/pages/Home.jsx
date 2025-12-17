import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, FaStar, FaFire, FaChevronLeft, FaChevronRight, FaUndo 
} from 'react-icons/fa';
import axios from 'axios';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const slides = [
    {
      title: 'SÁCH KINH TẾ HAY',
      subtitle: 'Nâng cao tư duy - Phát triển sự nghiệp',
      bg: 'linear-gradient(90deg, #ff7eb3 0%, #ff758c 100%)', 
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
      link: '/products?category=Kinh tế'
    },
    {
      title: 'GIẢM GIÁ ĐẾN 50%',
      subtitle: 'Bộ sưu tập Văn học Việt Nam - Đọc để hiểu đời',
      bg: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
      link: '/products?category=Văn học'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setFeaturedProducts(data.slice(0, 4));
        setNewProducts(data.slice(0, 8));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- COMPONENT Ô SẢN PHẨM: SỬA GIỐNG ẢNH 1 ---
  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 transition-all hover:shadow-md flex flex-col h-full">
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-md group">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => e.target.src = 'https://via.placeholder.com/300x400?text=Book'}
        />
        {/* Nhãn "Mới" xanh lá như ảnh 1 */}
        <div className="absolute top-2 left-2 bg-[#27ae60] text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
          Mới
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-1 leading-tight">
          {product.name}
        </h3>
        
        {/* Giá tiền và số lượng tồn kho (Ảnh 1) */}
        <div className="mt-2">
          <div className="text-[#d72e2e] font-bold text-lg mb-0.5">
            {product.price?.toLocaleString()}đ
          </div>
          <div className="text-[11px] text-gray-500 mb-3">
            Còn: {product.countInStock || 50} sản phẩm
          </div>
        </div>

        {/* Nút Thêm vào giỏ hàng màu đỏ trải dài (Ảnh 1) */}
        <button className="w-full bg-[#d72e2e] text-white py-2 rounded-md font-bold text-sm hover:bg-red-700 transition-colors uppercase">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );

  // --- COMPONENT CÔNG CỤ TÌM KIẾM/LỌC (ẢNH 1) ---
  const FilterBar = () => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Thương hiệu:</span>
          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-500 min-w-[120px]">
            <option>Văn học</option>
            <option>Kinh tế</option>
            <option>Ngoại ngữ</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Sắp xếp:</span>
          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-500 min-w-[120px]">
            <option>Mới nhất</option>
            <option>Giá từ thấp đến cao</option>
            <option>Giá từ cao đến thấp</option>
          </select>
        </div>
      </div>
      <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-500 border border-gray-300 px-4 py-1.5 rounded bg-gray-50 transition-all font-medium">
        <FaUndo size={12} /> Đặt lại
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      {/* BANNER (Ảnh 2) */}
      <section className="relative h-[420px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 flex items-center ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ background: slide.bg }}
          >
            <div className="container mx-auto px-4 flex items-center justify-between h-full">
              <div className="max-w-md animate-slideUp">
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                  <span className="text-yellow-300 mr-2">⚡</span>{slide.title}
                </h2>
                <p className="text-lg text-white/90 mb-8">{slide.subtitle}</p>
                <Link to={slide.link} className="bg-white text-gray-800 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-all inline-block">
                  Khám phá ngay
                </Link>
              </div>
              <div className="hidden lg:block animate-float">
                <img 
                  src={slide.image} 
                  className="w-[380px] h-[320px] object-cover rounded-2xl shadow-2xl border-4 border-white/20"
                  alt="Banner Book"
                />
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"><FaChevronLeft size={20}/></button>
        <button onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"><FaChevronRight size={20}/></button>
      </section>

      {/* TIÊU ĐỀ CHÍNH (Ảnh 1) */}
      <div className="text-center pt-12 pb-6">
        <h1 className="text-3xl font-black text-gray-800 mb-1 uppercase tracking-tight">Sách Hay Chính Hãng</h1>
        <p className="text-sm text-gray-400 font-semibold tracking-wide">Tìm thấy {featuredProducts.length + newProducts.length} sản phẩm</p>
      </div>

      {/* MAIN CONTENT (Ảnh 2 bố cục, Ô sản phẩm Ảnh 1) */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Thanh lọc giống ảnh 1 */}
        <FilterBar />

        {/* SÁCH NỔI BẬT */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 border-b-2 border-red-500 pb-2">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 uppercase tracking-wide">
              <FaFire className="text-red-500" /> SÁCH NỔI BẬT
            </h2>
            <Link to="/products" className="text-blue-500 text-xs font-bold hover:underline">XEM TẤT CẢ →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? <SkeletonGrid count={4} /> : featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>

        {/* SÁCH MỚI NHẤT */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b-2 border-blue-500 pb-2">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 uppercase tracking-wide">
              <FaBook className="text-blue-500" /> SÁCH MỚI NHẤT
            </h2>
            <Link to="/products" className="text-blue-500 text-xs font-bold hover:underline">XEM TẤT CẢ →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? <SkeletonGrid count={8} /> : newProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] text-white pt-16 pb-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16 text-sm">
            <div>
              <h4 className="font-bold text-lg mb-6">Về Chúng Tôi</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link className="hover:text-white transition-colors">Giới thiệu</Link></li>
                <li><Link className="hover:text-white transition-colors">Tin tức</Link></li>
                <li><Link className="hover:text-white transition-colors">Tuyển dụng</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Chính Sách</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
                <li><Link className="hover:text-white transition-colors">Chính sách vận chuyển</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Hỗ Trợ</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link className="hover:text-white transition-colors">Hướng dẫn mua hàng</Link></li>
                <li><Link className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Kết Nối</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link className="hover:text-white transition-colors">Facebook</Link></li>
                <li><Link className="hover:text-white transition-colors">Instagram</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
            <p>© 2024 BookStore.vn - Sách hay chính hãng</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const SkeletonGrid = ({ count }) => (
  [...Array(count)].map((_, i) => (
    <div key={i} className="bg-white p-4 rounded-lg animate-pulse border border-gray-100">
      <div className="bg-gray-100 aspect-[3/4] rounded-md mb-4" />
      <div className="bg-gray-100 h-4 w-3/4 mb-2" />
      <div className="bg-gray-200 h-10 w-full rounded" />
    </div>
  ))
);

export default Home;