import Customer from "../models/customerModel.js";
import generateToken from "../utils/generateToken.js";
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';

//@desc dang ky khach hang moi
//@route POST/api/customers
const registerCustomer = async (req, res, next)=>{
    const {email, name, phone, password} = req.body;

    try{
        // Validate required fields
        if (!email || !password || !name || !phone) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ thông tin: Tên, Email, SĐT và Mật khẩu"
            });
        }

        // Regex: Phải bắt đầu bằng số 0, và theo sau là 9 chữ số (Tổng 10 số)
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                message: "Số điện thoại không hợp lệ (Phải có 10 số và bắt đầu bằng số 0)"
            });
        }


        const customerExists = await Customer.findOne({email});
        if(customerExists){
            return res.status(400).json({message : "Email đã tồn tại"});
        }
        
        //tao customer
        const customer = await Customer.create({email, name, phone, password});

        // Trả về kết quả (Lưu ý: Token vẫn được tạo nhưng Frontend đã sửa để không tự lưu nữa)
        res.status(201).json({
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            token: generateToken(customer._id),
        });
    }catch(error){
        // Pass error to error handler middleware
        next(error);
    }
};

//desc dang nhap khach hang
//route POST/api/customer/login
const loginCustomer = async (req, res)=>{
    const {email, password}= req.body;

    try{
        const customer = await Customer.findOne({email});

        // ✅ KIỂM TRA TÀI KHOẢN BỊ VÔ HIỆU HÓA
        if(customer && customer.isActive === false){
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ admin."
            });
        }

        if(customer && (await customer.matchPassword(password))){
            res.json({
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone, // Trả thêm sđt để frontend hiển thị nếu cần
                isAdmin: customer.isAdmin,
                token: generateToken(customer._id),
            });
        }else{
            res.status(401).json({message: "Email hoặc mật khẩu không chính xác"});
        }
    }catch(error){
        res.status(500).json({message: "Lỗi máy chủ"});
    }
};

// ✅ LẤY TẤT CẢ KHÁCH HÀNG (ADMIN)
// @desc    Lấy tất cả khách hàng
// @route   GET /api/customers/all
// @access  Private/Admin
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Tính toán thống kê cho từng customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ user: customer._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        
        return {
          ...customer.toObject(),
          totalOrders,
          totalSpent
        };
      })
    );
    
    res.json(customersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CẤP/GỠ QUYỀN ADMIN
// @desc    Toggle admin status
// @route   PUT /api/customers/:id/toggle-admin
// @access  Private/Admin
const toggleCustomerAdmin = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    
    customer.isAdmin = !customer.isAdmin;
    await customer.save();
    
    res.json({
      message: customer.isAdmin ? 'Đã cấp quyền admin' : 'Đã gỡ quyền admin',
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        isAdmin: customer.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ VÔ HIỆU HÓA/KÍCH HOẠT TÀI KHOẢN
// @desc    Toggle active status
// @route   PUT /api/customers/:id/toggle-active
// @access  Private/Admin
const toggleCustomerActive = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    

    if (customer.isAdmin) {
      return res.status(400).json({ 
        message: 'Không thể vô hiệu hóa tài khoản admin. Vui lòng gỡ quyền admin trước.' 
      });
    }
    
    customer.isActive = customer.isActive === false ? true : false;
    await customer.save();
    
    res.json({
      message: customer.isActive ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản',
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerCart = async (req, res)=>{
    try {
        const customer = await Customer.findById(req.user._id).populate('cart.product');
        
        if(!customer){
            res.status(404);
            throw new Error('Không tìm thấy khách hàng');
        }


        const validCart = customer.cart.filter(item => item.product);
        
        res.json(validCart);
    } catch (error) {
        console.error('❌ Lỗi getCustomerCart:', error);
        res.status(500).json({ message: error.message });
    }
};

//@desc Them/cap nhat san pham trong gio hang
//@route POST /api/customer/cart
//@access Private
const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    console.log("👉 1. Backend nhận yêu cầu thêm giỏ:", { productId, quantity, user: req.user._id });

    const customer = await Customer.findById(req.user._id);
    const product = await Product.findById(productId);

    if (!product) {
      console.log("❌ Lỗi: Không tìm thấy sản phẩm với ID:", productId);
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }


    if (product.countInStock === 0) {
      return res.status(400).json({ message: 'Sản phẩm đã hết hàng' });
    }

    console.log("👉 2. Tìm thấy sản phẩm:", product.name, "Tồn kho:", product.countInStock);

    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {

      const newQuantity = customer.cart[cartItemIndex].quantity + Number(quantity);

      if (newQuantity > product.countInStock) {
        return res.status(400).json({ 
          message: `Chỉ còn ${product.countInStock} sản phẩm. Bạn đã có ${customer.cart[cartItemIndex].quantity} trong giỏ.` 
        });
      }
      
      customer.cart[cartItemIndex].quantity = newQuantity;
      console.log("👉 3. Sản phẩm đã có, cập nhật số lượng mới:", newQuantity);
    } else {
      if (Number(quantity) > product.countInStock) {
        return res.status(400).json({ 
          message: `Chỉ còn ${product.countInStock} sản phẩm` 
        });
      }
      
      const newItem = {
        product: productId,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: Number(quantity),
      };
      customer.cart.push(newItem);
      console.log("👉 3. Thêm sản phẩm mới vào mảng cart:", newItem);
    }

    console.log("👉 4. Đang lưu vào MongoDB...");
    await customer.save();
    await customer.populate('cart.product');
    
    console.log("✅ 5. Lưu thành công! Giỏ hàng hiện tại:", customer.cart.length, "món");

    res.status(201).json(customer.cart);

  } catch (error) {
    console.error("❌ LỖI NGHIÊM TRỌNG TRONG CONTROLLER:", error.message);
    if (error.name === 'ValidationError') {
        console.error("Chi tiết lỗi Validate:", error.errors);
    }
    res.status(400).json({ message: error.message });
  }
};

//@desc xoa san pham khoi gio hang
//@route DELETE /api/customer/cart/:productId
//@access Private
const removeItemFromCart = async(req, res)=>{
    try {
        const {productId} = req.params;
        const customer = await Customer.findById(req.user._id);

        if(!customer){
            res.status(404);
            throw new Error('Không tìm thấy khách hàng');
        }

        customer.cart = customer.cart.filter(
            (item) => item.product.toString() !== productId
        );
        
        await customer.save();
        await customer.populate('cart.product');
        
        res.json(customer.cart);
    } catch (error) {
        console.error('❌ Lỗi removeItemFromCart:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy thông tin hồ sơ người dùng
// @route   GET /api/customers/profile
// @access  Private
const getCustomerProfile = async (req, res) => {
  const customer = await Customer.findById(req.user._id);

  if (customer) {
    res.json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      isAdmin: customer.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }
};

// @desc    Cập nhật hồ sơ người dùng
// @route   PUT /api/customers/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const customer = await Customer.findById(req.user._id);

  if (customer) {
    customer.name = req.body.name || customer.name;
    customer.phone = req.body.phone || customer.phone;

    if (req.body.password) {
      customer.password = req.body.password;
    }

    const updatedCustomer = await customer.save();

    res.json({
      _id: updatedCustomer._id,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      isAdmin: updatedCustomer.isAdmin,
      phone: updatedCustomer.phone,
      token: generateToken(updatedCustomer._id),
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }
};

// @desc    Cập nhật số lượng sản phẩm trong giỏ hàng
// @route   PUT /api/customer/cart
// @access  Private
const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const customer = await Customer.findById(req.user._id);

    if (customer) {
      const itemIndex = customer.cart.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        customer.cart[itemIndex].quantity = Number(quantity);
        await customer.save();
        await customer.populate('cart.product');
        res.json(customer.cart);
      } else {
        res.status(404);
        throw new Error('Sản phẩm không có trong giỏ hàng');
      }
    } else {
      res.status(404);
      throw new Error('Không tìm thấy khách hàng');
    }
  } catch (error) {
    console.error('❌ Lỗi updateCartItemQuantity:', error);
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async(req, res)=>{
    try {
        const customer = await Customer.findById(req.user._id);

        if(!customer){
            res.status(404);
            throw new Error('Không tìm thấy khách hàng');
        }

        customer.cart = [];
        await customer.save();
        res.json({ message: 'Đã xóa giỏ hàng' });
    } catch (error) {
        console.error('❌ Lỗi clearCart:', error);
        res.status(500).json({ message: error.message });
    }
};

export{
    registerCustomer,
    loginCustomer,
    getCustomerCart,
    addItemToCart,
    removeItemFromCart,
    getCustomerProfile,
    updateUserProfile,
    updateCartItemQuantity,
    clearCart,
    getAllCustomers, 
    toggleCustomerAdmin,
    toggleCustomerActive,
};