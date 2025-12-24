// backend/controllers/productController.js - COMPLETE FIXED VERSION

import Product from "../models/productModel.js";
import Order from '../models/orderModel.js';

// @desc    Lấy tất cả sản phẩm (Có tìm kiếm & lọc danh mục)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
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

  // ✅ Chỉ hiển thị sản phẩm chưa bị ẩn
  const products = await Product.find({ 
    ...keyword, 
    ...category,
    isHidden: { $ne: true }
  });
  
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

// @desc    Lấy TẤT CẢ sản phẩm cho Admin (bao gồm cả ẩn)
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message 
    });
  }
};

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
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
        pageCount: 100,
        isHidden: false
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
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
      pageCount,
      isHidden
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    
    product.author = author || product.author;
    product.publisher = publisher || product.publisher;
    product.publicationYear = publicationYear || product.publicationYear;
    product.language = language || product.language;
    product.pageCount = pageCount || product.pageCount;
    
    // ✅ Cập nhật trạng thái ẩn/hiện
    if (isHidden !== undefined) {
      product.isHidden = isHidden;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sách');
  }
};

// @desc    Cập nhật số lượng tồn kho
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
const updateProductStock = async (req, res) => {
  try {
    const { countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.countInStock = countInStock;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ ẨN/HIỆN SẢN PHẨM
// @desc    Ẩn/Hiện sản phẩm
// @route   PUT /api/products/:id/toggle-visibility
// @access  Private/Admin
const toggleProductVisibility = async (req, res) => {
  try {
    console.log('🔄 Toggle visibility for product:', req.params.id);
    
    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    console.log('📦 Current isHidden:', product.isHidden);
    
    // ✅ TOGGLE: Nếu undefined hoặc false → true, nếu true → false
    product.isHidden = !product.isHidden;
    
    console.log('📦 New isHidden:', product.isHidden);
    
    const updatedProduct = await product.save();
    
    console.log('✅ Product updated successfully');
    
    res.json({
      success: true,
      message: product.isHidden ? 'Đã ẩn sản phẩm' : 'Đã hiển thị sản phẩm',
      product: updatedProduct
    });
  } catch (error) {
    console.error('❌ Toggle visibility error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Xóa sản phẩm (giữ lại cho trường hợp đặc biệt)
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

// ✅ TẠO ĐÁNH GIÁ SẢN PHẨM - COMPLETE FIXED
// @desc    Tạo đánh giá sản phẩm mới
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    console.log('📝 Creating review:', { productId, rating, comment, user: req.user.email });

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Không tìm thấy sách');
    }

    // Kiểm tra user đã mua sản phẩm chưa
    const orders = await Order.find({ 
      user: req.user._id, 
      'orderItems.product': productId,
      isPaid: true
    });

    console.log('🛍️ User orders with this product:', orders.length);

    if (orders.length === 0) {
      res.status(400);
      throw new Error('Bạn phải mua sách này trước khi được đánh giá');
    }

    // Kiểm tra đã đánh giá chưa
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Bạn đã đánh giá sách này rồi');
    }

    // Tạo review mới
    const review = {
      name: req.user.name || req.user.email,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    // ✅ CẬP NHẬT RATING VÀ NUMREVIEWS
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    console.log('✅ Updated stats:', {
      numReviews: product.numReviews,
      rating: product.rating
    });

    await product.save();
    
    res.status(201).json({ 
      message: 'Đánh giá đã được thêm',
      numReviews: product.numReviews,
      rating: product.rating
    });
  } catch (error) {
    console.error('❌ Review error:', error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

// ✅ LẤY TẤT CẢ ĐÁNH GIÁ CỦA SẢN PHẨM
// @desc    Lấy tất cả đánh giá của sản phẩm
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name email');
    
    if (!product) {
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }

    res.json({
      reviews: product.reviews,
      numReviews: product.numReviews,
      rating: product.rating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ XÓA ĐÁNH GIÁ
// @desc    Xóa đánh giá (Chỉ user tự xóa hoặc admin)
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }

    const review = product.reviews.find(r => r._id.toString() === reviewId);
    
    if (!review) {
      res.status(404);
      throw new Error('Không tìm thấy đánh giá');
    }

    // Chỉ cho phép user tự xóa hoặc admin xóa
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Không có quyền xóa đánh giá này');
    }

    product.reviews = product.reviews.filter(r => r._id.toString() !== reviewId);
    
    // ✅ Cập nhật lại rating và numReviews
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length > 0 
      ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
      : 0;

    await product.save();

    res.json({ message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// @desc    Thống kê sản phẩm bán chạy
// @route   GET /api/products/stats/best-selling
// @access  Private/Admin
const getBestSellingProducts = async (req, res) => {
  try {
    const bestSelling = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          name: '$productInfo.name',
          image: '$productInfo.image',
          category: '$productInfo.category',
          price: '$productInfo.price',
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json(bestSelling);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProducts,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  updateProductStock,
  toggleProductVisibility,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteProductReview,
  getBestSellingProducts,
};