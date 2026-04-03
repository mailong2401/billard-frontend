'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { BiUser, BiPhone, BiEnvelope, BiLock, BiSave, BiEdit } from 'react-icons/bi';

export default function StaffProfilePage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();
  const { user, logout } = useAuth();

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Thông tin cá nhân
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  
  // Đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = () => {
    if (!profile.full_name) {
      error('Vui lòng nhập họ tên');
      return;
    }
    
    setLoading(true);
    socket?.emit('update-user', {
      id: user?.id,
      full_name: profile.full_name,
      phone: profile.phone,
      role: user?.role,
      is_active: user?.is_active
    }, (res: any) => {
      if (res.success) {
        success('Cập nhật thông tin thành công');
        setIsEditing(false);
        // Cập nhật lại user trong context
        if (res.data) {
          // Auth context sẽ tự cập nhật khi có sự kiện từ server
        }
      } else {
        error(res.error || 'Cập nhật thất bại');
      }
      setLoading(false);
    });
  };

  const handleChangePassword = () => {
    if (!passwordData.oldPassword) {
      error('Vui lòng nhập mật khẩu cũ');
      return;
    }
    if (!passwordData.newPassword) {
      error('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setLoading(true);
    socket?.emit('change-password', {
      userId: user?.id,
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    }, (res: any) => {
      if (res.success) {
        success('Đổi mật khẩu thành công');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowChangePassword(false);
      } else {
        error(res.error || 'Đổi mật khẩu thất bại');
      }
      setLoading(false);
    });
  };

  if (!isClient || !isConnected) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
          Hồ sơ của tôi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Quản lý thông tin cá nhân và mật khẩu
        </p>

        {/* Thông tin cá nhân */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
              <BiUser /> Thông tin cá nhân
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <BiEdit className="h-4 w-4" />
                Chỉnh sửa
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Họ tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">{profile.full_name || 'Chưa cập nhật'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên đăng nhập
              </label>
              <p className="text-black dark:text-white">{user.username}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">{profile.email || 'Chưa cập nhật'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">{profile.phone || 'Chưa cập nhật'}</p>
              )}
            </div>
            
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setProfile({
                      full_name: user.full_name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <BiSave className="h-4 w-4" />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Đổi mật khẩu */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
              <BiLock /> Đổi mật khẩu
            </h2>
            {!showChangePassword && (
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <BiEdit className="h-4 w-4" />
                Đổi mật khẩu
              </button>
            )}
          </div>
          
          {showChangePassword && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </div>
          )}
          
          {!showChangePassword && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click "Đổi mật khẩu" để thay đổi mật khẩu đăng nhập.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
