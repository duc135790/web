import Customer from "../models/customerModel.js";
import generateToken from "../utils/generateToken.js";
import Product from '../models/productModel.js';
//@desc dang ky khach hang moi
//@route POST/api/customers
const registerCustomer = async (req, res)=>{
    const {email, name, phone, password} = req.body;

    try{
        const customerExists = await Customer.findOne({email});
        if(customerExists){
            return res.status(400).json({message : "Email da ton tai"});
        }
        //tao customer
        const customer = await Customer.create({email, name, phone, password});

        res.status(201).json({
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            token: generateToken(customer._id),
        });
    }catch(error){
        res.status(400).json({message: "Du lieu khong hop le", error: error.message})
    }
};

//desc dang nhap khach hang
//route POST/api/customer/login
const loginCustomer = async (req, res)=>{
    const {email, password}= req.body;

    try{
        const customer = await Customer.findOne({email});

        if(customer && (await customer.matchPassword(password))){
            res.json({
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                isAdmin: customer.isAdmin,
                token: generateToken(customer._id),
            });
        }else{
            res.status(401).json({message: "Email hoac mat khau khong chinh xac"});
        }
    }catch(error){
        res.status(500).json({message: "Loi may chu"});
    }
};
// export {registerCustomer, loginCustomer};

const getCustomerCart = async (req, res)=>{
    const customer = await Customer.findById(req.user._id);

    if(customer){
        await customer.populate('cart.product')
        res.json(customer.cart);
    }else{
        res.status(404);
        throw new Error('Không tìm thấy khách hàng');
    }
};

//@desc Them/cap nhat san pham trong gio hang
//@route POST /api/customer/cart
//@access Private
// const addItemToCart = async(req, res)=>{
//     const {productId, quantity} = req.body;
//     const customer = await Customer.findById(req.user._id);

//     if(!customer){
//         res.status(404)
//         throw new Error('Không tìm thấy khách hàng');
//     }

//     //lay thong tin san pham tu database
//     const product = await Product.findById(productId);
//     if(!product){
//         res.status(404);
//         throw new Error('Không tìm thấy sản phẩm');
//     }

//     //kiem tra san pham da co trong gio hang chua
//     const existItem = customer.cart.find(
//         (item)=> item.product.toString()===productId
//     );
//     if(existItem){
//         //neu co san pham trong gio hang thi chi cap nhat so luong
//         existItem.quantity = Number(quantity);
//     }else{
//         //tao item moi neu chua co
//         const cartItem = {
//             name: product.name,
//             quantity: Number(quantity),
//             image: product.image,
//             price: product.price,
//             product: productId,
//         };
//         customer.cart.push(cartItem);
//     }


//     //luu lai vao database
//     const updatedCustomer = await customer.save();
//     res.status(201).json(updatedCustomer.cart);
// };
// backend/controllers/customerController.js

const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // LOG 1: Xem dữ liệu nhận được
    console.log("👉 1. Backend nhận yêu cầu thêm giỏ:", { productId, quantity, user: req.user._id });

    const customer = await Customer.findById(req.user._id);
    const product = await Product.findById(productId);

    if (!product) {
      console.log("❌ Lỗi: Không tìm thấy sản phẩm với ID:", productId);
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }

    // LOG 2: Tìm thấy sản phẩm
    console.log("👉 2. Tìm thấy sản phẩm:", product.name);

    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      customer.cart[cartItemIndex].quantity += Number(quantity);
      console.log("👉 3. Sản phẩm đã có, cập nhật số lượng mới:", customer.cart[cartItemIndex].quantity);
    } else {
      // Quan trọng: Đảm bảo đủ trường dữ liệu theo Schema
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

    // LOG 4: Bắt đầu lưu
    console.log("👉 4. Đang lưu vào MongoDB...");
    const updatedCustomer = await customer.save();
    await customer.populate('cart.product')
    
    // LOG 5: Lưu xong
    console.log("✅ 5. Lưu thành công! Giỏ hàng hiện tại:", updatedCustomer.cart.length, "món");

    res.status(201).json(updatedCustomer.cart);

  } catch (error) {
    console.error("❌ LỖI NGHIÊM TRỌNG TRONG CONTROLLER:", error.message);
    // Bắt lỗi validation của Mongoose (thường là nguyên nhân chính)
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
    const{productId}=req.params;
    const customer = await Customer.findById(req.user._id);

    if(!customer){
        res.status(404);
        throw new Error('Không tìm thấy khách hàng');
    }

    //loai bo san pham can xoa
    customer.cart = customer.cart.filter(
        (item) => item.product.toString() !== productId
    );
    await customer.save();
    res.json(customer.cart);
};


// @desc    Cập nhật hồ sơ người dùng
// @route   PUT /api/customer/profile
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
  const { productId, quantity } = req.body; // Nhận ID và Số lượng MỚI

  const customer = await Customer.findById(req.user._id);

  if (customer) {
    // 1. Tìm vị trí sản phẩm trong mảng cart
    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // 2. Cập nhật số lượng
      customer.cart[itemIndex].quantity = Number(quantity);
      
      // 3. Lưu vào DB
      await customer.save();
      res.json(customer.cart);
    } else {
      res.status(404);
      throw new Error('Sản phẩm không có trong giỏ hàng');
    }
  } else {
    res.status(404);
    throw new Error('Không tìm thấy khách hàng');
  }
};



export{
    registerCustomer,
    loginCustomer,
    getCustomerCart,
    addItemToCart,
    removeItemFromCart,
    updateUserProfile,
    updateCartItemQuantity,
};