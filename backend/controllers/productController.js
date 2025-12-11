import Product from "../models/productModel.js";
import Order from '../models/orderModel.js';

// @desc    Lấy tất cả sản phẩm (Có tìm kiếm & lọc danh mục)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  //Xử lý tìm kiếm (Keyword)
  const keyword = req.query.keyword
    ? {
        $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { author: { $regex: req.query.keyword, $options: 'i' } },
        ]
      }
    : {};

  const category = req.query.category
    ? { category: req.query.category }
    : {};

  const products = await Product.find({ ...keyword, ...category });
  
  res.json(products);
};

// @desc    Lấy chi tiết một sản phẩm
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sách' });
    }
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy sách' });
  }
};

// @desc    Tạo sản phẩm mới (Dữ liệu mẫu)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    // Tạo một cuốn sách mẫu rỗng để Admin vào sửa sau
    const product = new Product({
        user: req.user._id,
        name: 'Tên sách mới',
        image: '/images/sample.jpg',
        description: 'Mô tả nội dung sách...',
        category: 'Văn học',
        price: 0,
        countInStock: 0,
        author: 'Tên tác giả',
        publisher: 'Nhà xuất bản',
        publicationYear: 2024,
        language: 'Tiếng Việt',
        pages: 100
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  // Lấy các trường dữ liệu Sách từ Frontend gửi lên
  const { 
      name, 
      price, 
      description, 
      image, 
      category, 
      countInStock,
      author,
      publisher,
      publicationYear,
      language,
      pages
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    
    // Cập nhật các trường sách
    product.author = author || product.author;
    product.publisher = publisher || product.publisher;
    product.publicationYear = publicationYear || product.publicationYear;
    product.language = language || product.language;
    product.pages = pages || product.pages;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sách');
  }
};

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Sách đã được xóa' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sách');
  }
};

// @desc    Tạo đánh giá sản phẩm mới
// @route   POST /api/products/:id/reviews
// @access  Private (Cần đăng nhập)
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sách');
  }

  const user = req.user;

  // Kiểm tra xem user đã mua sách này chưa
  const orders = await Order.find({ 
    user: user._id, 
    'orderItems.product': productId,
    isPaid: true
  });

  if (orders.length === 0) {
    res.status(400);
    throw new Error('Bạn phải mua sách này trước khi được đánh giá');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Bạn đã đánh giá sách này rồi');
  }

  const review = {
    name: user.name || user.fullName,
    rating: Number(rating),
    comment,
    user: user._id,
  };

  product.reviews.push(review);

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json({ message: 'Đánh giá đã được thêm' });
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};