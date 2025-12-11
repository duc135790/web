import { useState } from 'react';
import { FaCog, FaMobileAlt, FaBoxOpen } from 'react-icons/fa';
import AdminProducts from '../components/AdminProducts';
import AdminOrders from '../components/AdminOrders';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center space-x-2">
        <FaCog />
        <span>Quản trị hệ thống</span>
      </h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaMobileAlt className="inline mr-2" />
            Quản lý sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaBoxOpen className="inline mr-2" />
            Quản lý đơn hàng
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'orders' && <AdminOrders />}
      </div>
    </div>
  );
};

export default Admin;