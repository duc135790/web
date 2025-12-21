import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/login') && !url.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/customers/login', credentials),
  register: (userData) => api.post('/customers', userData),
  getProfile: () => api.get('/customers/profile'),
};

export const productsAPI = {
  getProducts: (keyword = '', category = '') => api.get('/products', { params: { keyword, category } }),
  
  getProductById: (id) => api.get(`/products/${id}`),
  
  getAllProducts: () => api.get('/products/admin/all'),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateStock: (id, countInStock) => api.put(`/products/${id}/stock`, { countInStock }),
  toggleVisibility: (id) => api.put(`/products/${id}/toggle-visibility`),
  getBestSelling: () => api.get('/products/stats/best-selling'),
};

export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/myorders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get('/orders'),
  updateStatus: (id, orderStatus) => api.put(`/orders/${id}/status`, { orderStatus }),
  updateOrderToDelivered: (id) => api.put(`/orders/${id}/deliver`),
  cancelOrder: (id) => api.delete(`/orders/${id}`),
  
  // Stats
  getRevenueStats: (period = 'month') => api.get('/orders/stats/revenue', { params: { period } }),
  getTopCustomers: () => api.get('/orders/stats/top-customers'),
  getOverview: () => api.get('/orders/stats/overview'),
};

export const cartAPI = {
  getCart: () => api.get('/customers/cart'),
  addToCart: (productId, quantity) => api.post('/customers/cart', { productId, quantity }),
  updateCartItem: (productId, quantity) => api.put('/customers/cart', { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/customers/cart/${productId}`),
};

export const vouchersAPI = {
  getActiveVouchers: () => api.get('/vouchers'),
  applyVoucher: (code, orderTotal) => api.post('/vouchers/apply', { code, orderTotal }),
  getAllVouchersAdmin: () => api.get('/vouchers/admin/all'),
  createVoucher: (voucherData) => api.post('/vouchers/create', voucherData),
  updateVoucher: (id, voucherData) => api.put(`/vouchers/${id}`, voucherData),
  deleteVoucher: (id) => api.delete(`/vouchers/${id}`),
  useVoucher: (id) => api.put(`/vouchers/${id}/use`)
};

export default api;