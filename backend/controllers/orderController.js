import Order from '../models/orderModel.js';
import Customer from '../models/customerModel.js';

//@desc Tao don hang moi
//@route POST /api/orders
//@access Private
const addOrderItems = async (req, res) => {
    const { shippingAddress, paymentMethod, totalPrice } = req.body;
    
    const customer = await Customer.findById(req.user._id);
    const cartItems = customer.cart;

    if(cartItems && cartItems.length === 0){
        res.status(400);
        throw new Error('Không có sản phẩm nào trong giỏ hàng');
    }else{
        const order = new Order({
            orderItems: cartItems.map((item) =>({
                ...item,
                product: item.product,
                _id: undefined,
            })),
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            totalPrice,
        });

        const createdOrder = await order.save();

        customer.cart = [];
        await customer.save();

        res.status(201).json(createdOrder);
    }
};

// @desc    Lấy các đơn hàng của người dùng đã đăng nhập
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Lấy TẤT CẢ đơn hàng
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name email');
  res.json(orders);
};

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.orderStatus = orderStatus;
    
    // Tự động cập nhật isDelivered nếu trạng thái là "Đã giao"
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

// @desc    Cập nhật trạng thái đơn hàng (Đã giao) - giữ lại cho tương thích
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
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

// @desc    Lấy đơn hàng bằng ID
// @route   GET /api/orders/:id
// @access  Private
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

// @desc    Xóa đơn hàng (chỉ dùng khi cần thiết)
// @route   DELETE /api/orders/:id
// @access  Private
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

// @desc    Thống kê doanh thu theo thời gian
// @route   GET /api/orders/stats/revenue
// @access  Private/Admin
const getRevenueStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year
    
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
      default: // month
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

// @desc    Thống kê khách hàng mua nhiều nhất
// @route   GET /api/orders/stats/top-customers
// @access  Private/Admin
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
      { $sort: { totalSpent: -1 } },
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

// @desc    Thống kê tổng quan
// @route   GET /api/orders/stats/overview
// @access  Private/Admin
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
  getOrdersOverview
};