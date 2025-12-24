import Order from '../models/orderModel.js';
import Customer from '../models/customerModel.js';
import Product from '../models/productModel.js';

// ✅ TẠO ĐƠN HÀNG - FIXED STOCK COMPLETELY
const addOrderItems = async (req, res) => {
    const { shippingAddress, paymentMethod, totalPrice, bankTransferInfo } = req.body;
    
    try {
        console.log('🛒 Creating order for user:', req.user._id);
        
        const customer = await Customer.findById(req.user._id);
        const cartItems = customer.cart;

        if (!cartItems || cartItems.length === 0) {
            res.status(400);
            throw new Error('Không có sản phẩm nào trong giỏ hàng');
        }

        console.log('📦 Cart items:', cartItems.length);

        // ✅ BƯỚC 1: KIỂM TRA TỒN KHO TRƯỚC
        for (const item of cartItems) {
            const product = await Product.findById(item.product);
            
            if (!product) {
                res.status(404);
                throw new Error(`Sản phẩm ${item.name} không tồn tại`);
            }
            
            console.log(`📊 Product: ${product.name} - Stock: ${product.countInStock} - Need: ${item.quantity}`);
            
            if (product.countInStock < item.quantity) {
                res.status(400);
                throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.countInStock} sản phẩm`);
            }
        }

        // ✅ BƯỚC 2: TẠO ĐƠN HÀNG
        const order = new Order({
            orderItems: cartItems.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                image: item.image,
                price: item.price,
                product: item.product,
            })),
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            totalPrice,
            isPaid: paymentMethod === 'BANK' ? true : false,
            paidAt: paymentMethod === 'BANK' ? Date.now() : undefined,
            bankTransferInfo: paymentMethod === 'BANK' ? bankTransferInfo : undefined
        });

        const createdOrder = await order.save();
        console.log('✅ Order created:', createdOrder._id);

        // ✅ BƯỚC 3: GIẢM SỐ LƯỢNG TỒN KHO - QUAN TRỌNG
        console.log('📉 Decreasing stock...');
        
        for (const item of cartItems) {
            const product = await Product.findById(item.product);
            
            if (product) {
                const oldStock = product.countInStock;
                const newStock = oldStock - item.quantity;
                
                console.log(`   → ${product.name}:`);
                console.log(`     • Old stock: ${oldStock}`);
                console.log(`     • Sold: ${item.quantity}`);
                console.log(`     • New stock: ${newStock}`);
                
                // ✅ CẬP NHẬT TRỰC TIẾP VÀ LƯU
                product.countInStock = Math.max(0, newStock);
                await product.save();
                
                console.log(`     ✅ Updated to: ${product.countInStock}`);
                
                // ✅ VERIFY LẠI SAU KHI LƯU
                const verifyProduct = await Product.findById(item.product);
                console.log(`     ✓ Verified stock in DB: ${verifyProduct.countInStock}`);
            } else {
                console.warn(`⚠️ Product not found: ${item.product}`);
            }
        }

        // ✅ BƯỚC 4: XÓA GIỎ HÀNG
        customer.cart = [];
        await customer.save();
        console.log('✅ Cart cleared for user:', customer._id);

        console.log('🎉 Order completed successfully!');
        res.status(201).json(createdOrder);
        
    } catch (error) {
        console.error('❌ CREATE ORDER ERROR:', error.message);
        console.error('❌ Stack:', error.stack);
        res.status(error.status || 500).json({ 
            message: error.message || 'Lỗi khi tạo đơn hàng' 
        });
    }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { isPaid } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    console.log('🔄 Updating payment status:', { orderId: req.params.id, isPaid });

    order.isPaid = isPaid;
    order.paidAt = isPaid ? Date.now() : null;

    const updatedOrder = await order.save();
    
    console.log('✅ Payment status updated:', updatedOrder);
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ Update payment error:', error);
    res.status(400).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

const getOrders = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    if (search) {
      query._id = { $regex: search, $options: 'i' };
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.orderStatus = orderStatus;
    
    if (orderStatus === 'Đã giao') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
};

const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = 'Đã giao';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    if (req.user.isAdmin || order.user._id.equals(req.user._id)) {
      res.json(order);
    } else {
      res.status(401);
      throw new Error('Không có quyền truy cập đơn hàng này');
    }
  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
};

const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await order.deleteOne(); 
    res.json({ message: 'Đơn hàng đã bị xóa thành công' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let groupBy;
    switch(period) {
      case 'day':
        groupBy = { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        groupBy = { 
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'year':
        groupBy = { 
          year: { $year: '$createdAt' }
        };
        break;
      default:
        groupBy = { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const revenue = await Order.aggregate([
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          averageOrder: { $avg: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 12 }
    ]);

    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopCustomers = async (req, res) => {
  try {
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          averageOrder: { $avg: '$totalPrice' }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { $unwind: '$customerInfo' },
      {
        $project: {
          _id: 1,
          name: '$customerInfo.name',
          email: '$customerInfo.email',
          phone: '$customerInfo.phone',
          totalOrders: 1,
          totalSpent: 1,
          averageOrder: 1
        }
      }
    ]);

    res.json(topCustomers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrdersOverview = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { 
  addOrderItems, 
  getMyOrders, 
  getOrders, 
  updateOrderStatus,
  updateOrderToDelivered, 
  getOrderById, 
  deleteOrder,
  getRevenueStats,
  getTopCustomers,
  getOrdersOverview,
  updatePaymentStatus 
};