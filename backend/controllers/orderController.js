import Order from '../models/orderModel.js';
import Customer from '../models/customerModel.js';
 //@desc Tao don hang moi
 //@route POST /api/orders
 //@access Private
 const addOrderItems = async (req, res) =>{
    //fe se gui len totalPrice, shippingAddress, paymentMethod
    const { shippingAddress, paymentMethod, totalPrice } = req.body;
    
    //lay gio hang tu req.user
    const customer = await Customer.findById(req.user._id);
    const cartItems = customer.cart;

    if(cartItems && cartItems.length === 0){
        res.status(400);
        throw new Error('Không có sản phẩm nào trong giỏ hàng');
    }else{
        //tao don hang moi
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

        //luu don hang vao db
        const createdOrder = await order.save();

        //xoa gio hang cua nguoi dung sau khi dat hang
        customer.cart = [];
        await customer.save();

        //tra ve don hang da tao
        res.status(201).json(createdOrder);
    }
 };

// @desc    Lấy các đơn hàng của người dùng đã đăng nhập
// @route   GET /api/orders/myorders
// @access  Private (Cần đăng nhập)
const getMyOrders = async (req, res) => {
  //Lay req.user._id tu middleware 'protect'
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};


// @desc    Lấy TẤT CẢ đơn hàng
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  //Lay tat ca don hang, dong thoi 'populate' ten cua user
  const orders = await Order.find({}).populate('user', 'id name email');
  res.json(orders);
};

// @desc    Cập nhật trạng thái đơn hàng (Đã giao)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
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
    // Kiem tra bao mat
    // 1. User co phai la Admin khong?
    // 2. User co phai la chu cua don hang nay khong?
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

export { addOrderItems, getMyOrders, getOrders, updateOrderToDelivered, getOrderById };