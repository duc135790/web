import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { customersAPI } from '../utils/api';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const Profile = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ Validate
      if (changingPassword) {
        if (!formData.currentPassword) {
          throw new Error('Vui lòng nhập mật khẩu cũ');
        }
        if (!formData.newPassword) {
          throw new Error('Vui lòng nhập mật khẩu mới');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Mật khẩu mới không khớp');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
        }
      }

      // ✅ Validate phone
      const phoneRegex = /^0\d{9}$/;
      if (formData.phone && !phoneRegex.test(formData.phone)) {
        throw new Error('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');
      }

      // ✅ Chuẩn bị data gửi lên
      const updateData = {
        name: formData.name,
        phone: formData.phone
      };

      if (changingPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await customersAPI.updateProfile(updateData);

      // ✅ Cập nhật localStorage và context
      const updatedUser = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        isAdmin: response.data.isAdmin
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('token', response.data.token);

      // ✅ Re-login để cập nhật context
      await login(user.email, changingPassword ? formData.newPassword : formData.currentPassword || 'temp');

      setSuccess('✅ Cập nhật thông tin thành công!');
      setEditing(false);
      setChangingPassword(false);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setChangingPassword(false);
    setError('');
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Vui lòng đăng nhập để xem thông tin</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Thông tin tài khoản</h1>

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2 text-blue-600" />
                Họ tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2 border rounded-lg ${
                  editing ? 'border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 border-gray-300'
                }`}
              />
            </div>

            {/* Email (không cho sửa) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2 text-green-600" />
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2 text-purple-600" />
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2 border rounded-lg ${
                  editing ? 'border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-50 border-gray-300'
                }`}
                placeholder="0xxxxxxxxx"
              />
            </div>

            {/* Đổi mật khẩu */}
            {editing && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Đổi mật khẩu</h3>
                  <button
                    type="button"
                    onClick={() => setChangingPassword(!changingPassword)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {changingPassword ? 'Không đổi mật khẩu' : 'Đổi mật khẩu'}
                  </button>
                </div>

                {changingPassword && (
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaLock className="inline mr-2 text-red-600" />
                        Mật khẩu cũ *
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaLock className="inline mr-2 text-green-600" />
                        Mật khẩu mới *
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaLock className="inline mr-2 text-orange-600" />
                        Xác nhận mật khẩu mới *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit />
                  Chỉnh sửa thông tin
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaTimes />
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Khi đổi mật khẩu, bạn sẽ cần đăng nhập lại với mật khẩu mới.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;