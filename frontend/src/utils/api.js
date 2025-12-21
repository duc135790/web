import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

// Handle response errors - ĐÃ SỬA: Chỉ logout khi thực sự 401
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error(`❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    
    // ✅ CHỈ logout khi thực sự là lỗi authentication
    // VÀ không phải là request login/register
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthRequest = url.includes('/login') || url.includes('/register');
      
      if (!isAuthRequest) {
        console.warn('⚠️ 401 Unauthorized - Token hết hạn');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Chỉ redirect nếu không phải đang ở trang login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// ✅ Auth API
export const authAPI = {
  login: (credentials) => api.post('/customers/login', credentials),
  register: (userData) => api.post('/customers', userData),
  getProfile: () => api.get('/customers/profile'),
};

// ✅ Products API
export const productsAPI = {
  getProducts: (category) => api.get('/products', { params: { category: category } }),
  getProductById: (id) => api.get(`/products/${id}`),
  getAllProducts: () => api.get('/products/admin/all'),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateStock: (id, countInStock) => api.put(`/products/${id}/stock`, { countInStock }),
};

// ✅ Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/myorders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get('/orders'),
  updateOrderToDelivered: (id) => api.put(`/orders/${id}/deliver`),
  cancelOrder: (id) => api.delete(`/orders/${id}`),
};

// ✅ Cart API
export const cartAPI = {
  getCart: () => api.get('/customers/cart'),
  addToCart: (productId, quantity) => api.post('/customers/cart', { productId, quantity }),
  updateCartItem: (productId, quantity) => api.put('/customers/cart', { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/customers/cart/${productId}`),
};

export default api;