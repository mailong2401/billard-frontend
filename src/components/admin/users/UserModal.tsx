'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { BiX, BiReset } from 'react-icons/bi';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onResetPassword?: (userId: number, newPassword: string) => void;
  user?: any;
}

export default function UserModal({ isOpen, onClose, onSubmit, onResetPassword, user }: UserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    role: 'client',
    is_active: true
  });
  
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        full_name: user.full_name,
        phone: user.phone || '',
        role: user.role,
        is_active: user.is_active
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        role: 'client',
        is_active: true
      });
    }
    // Reset reset password state khi đóng modal
    setShowResetPassword(false);
    setResetPasswordData({ newPassword: '', confirmPassword: '' });
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user && formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    
    const submitData = { ...formData };
    if (!user) {
      delete submitData.confirmPassword;
    } else {
      delete submitData.password;
      delete submitData.confirmPassword;
    }
    
    onSubmit(submitData);
  };

  const handleResetPassword = () => {
    if (!resetPasswordData.newPassword) {
      alert('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (resetPasswordData.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (user && onResetPassword) {
      onResetPassword(user.id, resetPasswordData.newPassword);
      setShowResetPassword(false);
      setResetPasswordData({ newPassword: '', confirmPassword: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Sửa người dùng' : 'Thêm người dùng mới'}>
      {!showResetPassword ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
              placeholder="Nhập họ tên"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!!user}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
              placeholder="Số điện thoại"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            >
              <option value="admin">Admin</option>
              <option value="staff">Nhân viên</option>
              <option value="client">Khách hàng</option>
            </select>
          </div>

          {/* Trạng thái tài khoản - chỉ hiển thị khi sửa */}
          {user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái tài khoản
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Khóa</option>
              </select>
            </div>
          )}

          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                  placeholder="Nhập mật khẩu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                  placeholder="Xác nhận mật khẩu"
                />
              </div>
            </>
          )}

          {/* Nút Reset mật khẩu (chỉ hiển thị khi sửa user) */}
          {user && (
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-400 dark:border-gray-500 text-black dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <BiReset className="h-4 w-4" />
              Reset mật khẩu
            </button>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-all hover:scale-[1.02] active:scale-95"
            >
              {user ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      ) : (
        // Form reset mật khẩu
        <div className="space-y-4">
<div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-4 border border-gray-200 dark:border-gray-700">
  <p className="text-sm text-gray-700 dark:text-gray-300">
    ⚠️ Đặt lại mật khẩu cho tài khoản: <strong>{user?.username}</strong>
  </p>
</div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={resetPasswordData.newPassword}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={resetPasswordData.confirmPassword}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
              placeholder="Xác nhận mật khẩu mới"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowResetPassword(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleResetPassword}
                className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-all hover:scale-[1.02] active:scale-95"
            >
              Đặt lại mật khẩu
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
