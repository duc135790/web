import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Tạo dữ liệu
const createData = async () => {
  try {
    await connectDB();

    // 1. TẠO CUSTOMERS
    console.log('\n📝 Đang tạo customers...');
    
    const customersCollection = mongoose.connection.collection('customers');
    
    // Xóa dữ liệu cũ
    await customersCollection.deleteMany({});
    
    const customers = [
      {
        email: 'admin@bookstore.com',
        name: 'Admin',
        phone: '0901234567',
        password: await hashPassword('admin123'),
        isAdmin: true,
        cart: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user1@example.com',
        name: 'Nguyễn Văn A',
        phone: '0909876543',
        password: await hashPassword('user123'),
        isAdmin: false,
        cart: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await customersCollection.insertMany(customers);
    console.log('✅ Đã tạo 2 customers');

    // 2. TẠO PRODUCTS
    console.log('\n📚 Đang tạo products...');
    
    const productsCollection = mongoose.connection.collection('products');
    
    // Xóa dữ liệu cũ
    await productsCollection.deleteMany({});
    
    const products = [
      {
        name: 'Nhà Giả Kim',
        author: 'Paulo Coelho',
        category: 'Văn học',
        brand: 'Văn học',
        price: 79000,
        description: 'Tác phẩm nổi tiếng của Paulo Coelho kể về hành trình tìm kiếm kho báu và ý nghĩa cuộc đời.',
        countInStock: 50,
        stock: 50,
        inStock: true,
        image: 'https://tse1.mm.bing.net/th/id/OIP.z3tYSIiNPM_ayQXYUdWfEQHaL0?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
        publisher: 'NXB Hội Nhà Văn',
        publicationYear: 2020,
        pageCount: 227,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đắc Nhân Tâm',
        author: 'Dale Carnegie',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 86000,
        description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử của Dale Carnegie.',
        countInStock: 100,
        stock: 100,
        inStock: true,
        image: 'https://tiemsach.org/wp-content/uploads/2023/07/Ebook-Dac-nhan-tam.jpg',
        publisher: 'NXB Tổng Hợp',
        publicationYear: 2019,
        pageCount: 320,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
        author: 'Rosie Nguyễn',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 75000,
        description: 'Những bài học về tuổi trẻ, khát vọng và nỗ lực của tác giả Rosie Nguyễn.',
        countInStock: 80,
        stock: 80,
        inStock: true,
        image: 'https://tse1.mm.bing.net/th/id/OIP.lfiasV6OsOrNKr2WEtqnIAHaLC?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
        publisher: 'NXB Hội Nhà Văn',
        publicationYear: 2018,
        pageCount: 264,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sapiens: Lược Sử Loài Người',
        author: 'Yuval Noah Harari',
        category: 'Lịch sử',
        brand: 'Lịch sử',
        price: 189000,
        description: 'Câu chuyện về sự tiến hóa của loài người từ thời nguyên thủy đến hiện đại.',
        countInStock: 45,
        stock: 45,
        inStock: true,
        image: 'https://tse3.mm.bing.net/th/id/OIP.ti_YvbUA0bhtfs4kAIywKQHaLZ?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
        publisher: 'NXB Trẻ',
        publicationYear: 2021,
        pageCount: 544,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
        author: 'Nguyễn Nhật Ánh',
        category: 'Văn học',
        brand: 'Văn học',
        price: 95000,
        description: 'Tác phẩm văn học về tuổi thơ đẹp đẽ và đầy hoài niệm của Nguyễn Nhật Ánh.',
        countInStock: 60,
        stock: 60,
        inStock: true,
        image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1545314990i/10433999.jpg',
        publisher: 'NXB Trẻ',
        publicationYear: 2017,
        pageCount: 368,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Harry Potter và Hòn Đá Phù Thủy',
        author: 'J.K. Rowling',
        category: 'Thiếu nhi',
        brand: 'Thiếu nhi',
        price: 120000,
        description: 'Cuốn sách đầu tiên trong series Harry Potter nổi tiếng thế giới.',
        countInStock: 70,
        stock: 70,
        inStock: true,
        image: 'https://cungdocsach.vn/wp-content/uploads/2019/10/Harry-potter-v%C3%A0-h%C3%B2n-%C4%91%C3%A1-ph%C3%B9-th%E1%BB%A7y.gif',
        publisher: 'NXB Trẻ',
        publicationYear: 2020,
        pageCount: 396,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Toán Học Lớp 12',
        author: 'Bộ Giáo Dục',
        category: 'Giáo khoa',
        brand: 'Giáo khoa',
        price: 45000,
        description: 'Sách giáo khoa Toán lớp 12 theo chương trình mới.',
        countInStock: 120,
        stock: 120,
        inStock: true,
        image: 'https://toanmath.com/wp-content/uploads/2024/02/sach-giao-khoa-toan-12-tap-1-ket-noi-tri-thuc-voi-cuoc-song.png',
        publisher: 'NXB Giáo Dục Việt Nam',
        publicationYear: 2023,
        pageCount: 200,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tiếng Anh Giao Tiếp Cơ Bản',
        author: 'Nhiều tác giả',
        category: 'Ngoại ngữ',
        brand: 'Ngoại ngữ',
        price: 65000,
        description: 'Giáo trình tiếng Anh giao tiếp cơ bản cho người mới bắt đầu.',
        countInStock: 90,
        stock: 90,
        inStock: true,
        image: 'https://tse2.mm.bing.net/th/id/OIP.Sy5G_Hay2ygizxcV_SKVvQHaHa?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
        publisher: 'NXB Đại Học Quốc Gia',
        publicationYear: 2022,
        pageCount: 280,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    {
        name: 'Nhà Giả Kim',
        author: 'Paulo Coelho',
        category: 'Văn học',
        brand: 'Văn học',
        price: 79000,
        description: 'Tác phẩm nổi tiếng của Paulo Coelho kể về hành trình tìm kiếm kho báu và ý nghĩa cuộc đời của chàng chăn cừu Santiago.',
        countInStock: 50,
        stock: 50,
        inStock: true,
        image: 'https://tiemsach.org/wp-content/uploads/2023/08/Nha-Gia-Kim-1.jpg',
        publisher: 'NXB Hội Nhà Văn',
        publicationYear: 2020,
        pageCount: 227,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
        author: 'Nguyễn Nhật Ánh',
        category: 'Văn học',
        brand: 'Văn học',
        price: 95000,
        description: 'Tác phẩm văn học về tuổi thơ đẹp đẽ và đầy hoài niệm của Nguyễn Nhật Ánh.',
        countInStock: 60,
        stock: 60,
        inStock: true,
        image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1545314990i/10433999.jpg',
        publisher: 'NXB Trẻ',
        publicationYear: 2017,
        pageCount: 368,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mắt Biếc',
        author: 'Nguyễn Nhật Ánh',
        category: 'Văn học',
        brand: 'Văn học',
        price: 85000,
        description: 'Chuyện tình đẹp và buồn của Ngạn và Hà Lan qua ngòi bút tài hoa của Nguyễn Nhật Ánh.',
        countInStock: 45,
        stock: 45,
        inStock: true,
        image: 'https://th.bing.com/th/id/R.f5eb7b93f4cd2b4777b31c35d1174804?rik=DR07G06iM3heNA&riu=http%3a%2f%2fbizweb.dktcdn.net%2fthumb%2fgrande%2f100%2f017%2f781%2fproducts%2f2019-11-05-09-36-21-1-390x510.jpg%3fv%3d1641123067877&ehk=9HxFDaRuSBIxCys3PrLr4rtqjChfE86cZdOmT1IreBw%3d&risl=&pid=ImgRaw&r=0',
        publisher: 'NXB Trẻ',
        publicationYear: 2018,
        pageCount: 272,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Số Đỏ',
        author: 'Vũ Trọng Phụng',
        category: 'Văn học',
        brand: 'Văn học',
        price: 68000,
        description: 'Tác phẩm kinh điển của văn học Việt Nam hiện đại, phê phán xã hội sắc sảo.',
        countInStock: 30,
        stock: 30,
        inStock: true,
        image: 'https://salt.tikicdn.com/ts/product/a7/14/57/2160a52816265cd80ea8cdc7519418f2.jpg',
        publisher: 'NXB Văn Học',
        publicationYear: 2019,
        pageCount: 280,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chí Phèo',
        author: 'Nam Cao',
        category: 'Văn học',
        brand: 'Văn học',
        price: 55000,
        description: 'Tác phẩm văn học kinh điển về số phận con người trong xã hội cũ.',
        countInStock: 40,
        stock: 40,
        inStock: true,
        image: 'https://cdn0.fahasa.com/media/flashmagazine/images/page_images/chi_pheo_va_nhung_truyen_ngan_khac/2021_01_07_15_28_33_1-390x510.jpg',
        publisher: 'NXB Kim Đồng',
        publicationYear: 2020,
        pageCount: 156,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tắt Đèn',
        author: 'Ngô Tất Tố',
        category: 'Văn học',
        brand: 'Văn học',
        price: 72000,
        description: 'Tác phẩm văn học hiện thực chủ nghĩa xuất sắc của văn học Việt Nam.',
        countInStock: 35,
        stock: 35,
        inStock: true,
        image: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1479993956l/13147425._SX318_.jpg',
        publisher: 'NXB Văn Học',
        publicationYear: 2019,
        pageCount: 324,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Vợ Nhặt',
        author: 'Kim Lân',
        category: 'Văn học',
        brand: 'Văn học',
        price: 48000,
        description: 'Truyện ngắn nổi tiếng về tình người và hoàn cảnh khó khăn trong nạn đói.',
        countInStock: 50,
        stock: 50,
        inStock: true,
        image: 'https://bizweb.dktcdn.net/100/370/339/products/vo-nhat-danh-tac.jpg?v=1652416378167',
        publisher: 'NXB Kim Đồng',
        publicationYear: 2020,
        pageCount: 128,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lão Hạc',
        author: 'Nam Cao',
        category: 'Văn học',
        brand: 'Văn học',
        price: 52000,
        description: 'Truyện ngắn cảm động về người nông dân nghèo khổ và lòng nhân ái.',
        countInStock: 45,
        stock: 45,
        inStock: true,
        image: 'https://2.bp.blogspot.com/-V6TQJ5bvhJQ/XCNEo_4RU5I/AAAAAAAAAb4/0l6mm33r14sEQmnf3vtxYOoqTbkvIMi1ACLcBGAs/s1600/lao_hac__nam_cao.jpg',
        publisher: 'NXB Kim Đồng',
        publicationYear: 2019,
        pageCount: 96,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dế Mèn Phiêu Lưu Ký',
        author: 'Tô Hoài',
        category: 'Văn học',
        brand: 'Văn học',
        price: 65000,
        description: 'Tác phẩm kinh điển cho thiếu nhi về cuộc phiêu lưu của chú dế mèn.',
        countInStock: 70,
        stock: 70,
        inStock: true,
        image: 'https://thuviensach.vn/img/news/2022/09/larger/1095-de-men-phieu-luu-ky-1.jpg?v=8025',
        publisher: 'NXB Kim Đồng',
        publicationYear: 2020,
        pageCount: 216,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Truyện Kiều',
        author: 'Nguyễn Du',
        category: 'Văn học',
        brand: 'Văn học',
        price: 88000,
        description: 'Tác phẩm kinh điển vĩ đại nhất của văn học Việt Nam.',
        countInStock: 55,
        stock: 55,
        inStock: true,
        image: 'https://tse3.mm.bing.net/th/id/OIP.hjnKIa8nOBq_V0LXiAqPwAHaLL?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
        publisher: 'NXB Văn Học',
        publicationYear: 2018,
        pageCount: 384,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chiếc Lá Cuối Cùng',
        author: 'O.Henry',
        category: 'Văn học',
        brand: 'Văn học',
        price: 58000,
        description: 'Tuyển tập truyện ngắn hay nhất của O.Henry.',
        countInStock: 42,
        stock: 42,
        inStock: true,
        image: 'https://toplist.vn/images/800px/bai-van-phan-tich-hinh-tuong-chiec-la-cuoi-cung-so-10-421040.jpg',
        publisher: 'NXB Văn Học',
        publicationYear: 2019,
        pageCount: 192,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Những Người Khốn Khổ',
        author: 'Victor Hugo',
        category: 'Văn học',
        brand: 'Văn học',
        price: 198000,
        description: 'Kiệt tác văn học thế giới về tình người và sự công bằng xã hội.',
        countInStock: 28,
        stock: 28,
        inStock: true,
        image: 'https://sachnoi.vip/wp-content/uploads/2023/01/Nhung-nguoi-khon-kho.jpg',
        publisher: 'NXB Văn Học',
        publicationYear: 2019,
        pageCount: 896,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // KỸ NĂNG SỐNG (10 sách)
      {
        name: 'Đắc Nhân Tâm',
        author: 'Dale Carnegie',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 86000,
        description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử của Dale Carnegie.',
        countInStock: 100,
        stock: 100,
        inStock: true,
        image: 'https://tiemsach.org/wp-content/uploads/2023/07/Ebook-Dac-nhan-tam.jpg',
        publisher: 'NXB Tổng Hợp',
        publicationYear: 2019,
        pageCount: 320,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
        author: 'Rosie Nguyễn',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 75000,
        description: 'Những bài học về tuổi trẻ, khát vọng và nỗ lực của tác giả Rosie Nguyễn.',
        countInStock: 80,
        stock: 80,
        inStock: true,
        image: 'https://cdn0.fahasa.com/media/flashmagazine/images/page_images/tuoi_tre_dang_gia_bao_nhieu_tai_ban_2021/2021_09_29_08_49_04_1-390x510.jpg',
        publisher: 'NXB Hội Nhà Văn',
        publicationYear: 2018,
        pageCount: 264,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Không Diệt Không Sinh Đừng Sợ Hãi',
        author: 'Thích Nhất Hạnh',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 92000,
        description: 'Những lời dạy của Thiền sư Thích Nhất Hạnh về nghệ thuật sống an lạc.',
        countInStock: 65,
        stock: 65,
        inStock: true,
        image: 'https://tse1.mm.bing.net/th/id/OIP.9y9QlCXWoI2-JTK2kDpmGwHaHa?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
        publisher: 'NXB Tổng Hợp',
        publicationYear: 2020,
        pageCount: 256,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '7 Thói Quen Hiệu Quả',
        author: 'Stephen R. Covey',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 125000,
        description: 'Cuốn sách kinh điển về phát triển bản thân và quản lý thời gian hiệu quả.',
        countInStock: 72,
        stock: 72,
        inStock: true,
        image: 'https://pos.nvncdn.com/fd5775-40602/ps/20240329_LRErpdCwzC.jpeg',
        publisher: 'NXB Tổng Hợp',
        publicationYear: 2019,
        pageCount: 448,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tư Duy Nhanh Và Chậm',
        author: 'Daniel Kahneman',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 168000,
        description: 'Nghiên cứu về hai hệ thống tư duy và cách chúng hình thành quyết định của chúng ta.',
        countInStock: 48,
        stock: 48,
        inStock: true,
        image: 'https://thuviensach.vn/img/news/2022/08/larger/537-tu-duy-nhanh-va-cham-1.jpg?v=5840',
        publisher: 'NXB Thế Giới',
        publicationYear: 2020,
        pageCount: 612,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nghĩ Giàu Làm Giàu',
        author: 'Napoleon Hill',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 98000,
        description: 'Bí quyết thành công từ những người giàu có nhất thế giới.',
        countInStock: 85,
        stock: 85,
        inStock: true,
        image: 'https://tse2.mm.bing.net/th/id/OIP.GGstqCIiYdS5moAc2rXCPwHaK7?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
        publisher: 'NXB Tổng Hợp',
        publicationYear: 2019,
        pageCount: 392,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Quẳng Gánh Lo Đi Và Vui Sống',
        author: 'Dale Carnegie',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 82000,
        description: 'Nghệ thuật giảm căng thẳng và sống một cuộc đời hạnh phúc hơn.',
        countInStock: 92,
        stock: 92,
        inStock: true,
        image: 'https://firstnews.vn/upload/products/original/-1727087322.jpg',
        publisher: 'NXB Tổng Hợp',
        publicationYear: 2018,
        pageCount: 368,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Atomic Habits',
        author: 'James Clear',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 135000,
        description: 'Phương pháp thay đổi thói quen hiệu quả để đạt được mục tiêu lớn.',
        countInStock: 68,
        stock: 68,
        inStock: true,
        image: 'https://cdn1.fahasa.com/media/flashmagazine/images/page_images/thay_doi_ti_hon_hieu_qua_bat_ngo_tbl6/2023_04_18_14_07_38_1-390x510.jpg',
        publisher: 'NXB Thế Giới',
        publicationYear: 2021,
        pageCount: 384,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Khéo Ăn Nói Sẽ Có Được Thiên Hạ',
        author: 'Trác Nhã',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 78000,
        description: 'Nghệ thuật giao tiếp khéo léo trong cuộc sống và công việc.',
        countInStock: 75,
        stock: 75,
        inStock: true,
        image: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8936067605655.jpg',
        publisher: 'NXB Lao Động',
        publicationYear: 2020,
        pageCount: 296,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'The Power Of Now',
        author: 'Eckhart Tolle',
        category: 'Kỹ năng sống',
        brand: 'Kỹ năng sống',
        price: 142000,
        description: 'Sức mạnh của hiện tại - Hướng dẫn tu luyện tâm linh.',
        countInStock: 52,
        stock: 52,
        inStock: true,
        image: 'https://down-id.img.susercontent.com/file/5067f05cbd05798067736c62b2f1a1de',
        publisher: 'NXB Thế Giới',
        publicationYear: 2020,
        pageCount: 328,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // LỊCH SỬ (6 sách)
      {
        name: 'Sapiens: Lược Sử Loài Người',
        author: 'Yuval Noah Harari',
        category: 'Lịch sử',
        brand: 'Lịch sử',
        price: 189000,
        description: 'Câu chuyện về sự tiến hóa của loài người từ thời nguyên thủy đến hiện đại.',
        countInStock: 45,
        stock: 45,
        inStock: true,
        image: 'https://cdn0.fahasa.com/media/flashmagazine/images/page_images/sapiens_luoc_su_loai_nguoi/2023_03_21_16_35_44_1-390x510.jpg',
        publisher: 'NXB Trẻ',
        publicationYear: 2021,
        pageCount: 544,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Homo Deus: Lược Sử Tương Lai',
        author: 'Yuval Noah Harari',
        category: 'Lịch sử',
        brand: 'Lịch sử',
        price: 195000,
        description: 'Những dự báo táo bạo về tương lai của loài người.',
        countInStock: 38,
        stock: 38,
        inStock: true,
        image: 'https://thuviensach.vn/img/news/2022/09/larger/369-homo-deus-luoc-su-tuong-lai-1.jpg?v=8146',
        publisher: 'NXB Trẻ',
        publicationYear: 2020,
        pageCount: 496,
        language: 'Tiếng Việt',
        reviews: [],
        rating: 0,
        numReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];
    
    await productsCollection.insertMany(products);
    console.log('✅ Đã tạo 8 products');

    // 3. TẠO COLLECTION ORDERS (rỗng)
    console.log('\n📦 Đang tạo collection orders...');
    const ordersCollection = mongoose.connection.collection('orders');
    await ordersCollection.deleteMany({});
    console.log('✅ Collection orders đã sẵn sàng');

    // 4. HIỂN THỊ THÔNG TIN
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TẠO DỮ LIỆU THÀNH CÔNG!');
    console.log('='.repeat(60));
    
    console.log('\n📊 Thống kê:');
    console.log(`   - Customers: ${await customersCollection.countDocuments()} tài khoản`);
    console.log(`   - Products: ${await productsCollection.countDocuments()} sách`);
    console.log(`   - Orders: ${await ordersCollection.countDocuments()} đơn hàng`);
    
    console.log('\n🔐 Tài khoản đăng nhập:');
    console.log('\n   📌 ADMIN:');
    console.log('      Email: admin@bookstore.com');
    console.log('      Password: admin123');
    console.log('\n   📌 USER:');
    console.log('      Email: user1@example.com');
    console.log('      Password: user123');
    
    console.log('\n💡 Bước tiếp theo:');
    console.log('   1. Chạy backend: npm run server');
    console.log('   2. Chạy frontend: npm run client');
    console.log('   3. Hoặc chạy cả 2: npm run dev');
    console.log('   4. Truy cập: http://localhost:5173');
    console.log('\n' + '='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Chạy script
createData();