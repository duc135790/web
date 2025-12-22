// ============================================
// backend/routes/customerRoutes.js - FIXED
// ============================================
import express from 'express';
const router = express.Router();
import{
    registerCustomer,
    loginCustomer,
    getCustomerCart,
    addItemToCart,
    removeItemFromCart,
    getCustomerProfile,
    updateUserProfile,
    updateCartItemQuantity,
    clearCart,
    getAllCustomers, // ✅
    toggleCustomerAdmin, // ✅
    toggleCustomerActive, // ✅
}from '../controllers/customerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

console.log('📋 Customer routes loading...');

// Public routes (không cần đăng nhập)
router.post('/', registerCustomer);
router.post('/login', loginCustomer);

console.log('  ✅ POST / (register) registered');
console.log('  ✅ POST /login registered');

// ✅ Admin routes (phải đặt trước các route động)
router.get('/all', protect, admin, getAllCustomers);
router.put('/:id/toggle-admin', protect, admin, toggleCustomerAdmin);
router.put('/:id/toggle-active', protect, admin, toggleCustomerActive);

console.log('  ✅ GET /all registered');
console.log('  ✅ PUT /:id/toggle-admin registered');
console.log('  ✅ PUT /:id/toggle-active registered');

// Private routes (cần đăng nhập)
router.route('/cart')
    .get(protect, getCustomerCart)
    .post(protect, addItemToCart)
    .put(protect, updateCartItemQuantity);

console.log('  ✅ GET /cart registered');
console.log('  ✅ POST /cart registered');
console.log('  ✅ PUT /cart registered');

router.delete('/cart/:productId', protect, removeItemFromCart);

console.log('  ✅ DELETE /cart/:productId registered');

router.route('/profile')
    .get(protect, getCustomerProfile)
    .put(protect, updateUserProfile);

console.log('  ✅ GET /profile registered');
console.log('  ✅ PUT /profile registered');

console.log('✅ Customer routes loaded successfully');

export default router;