'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { BiPlus, BiEdit, BiTrash, BiSearch, BiUser, BiUserPlus, BiUserCheck, BiUserX } from 'react-icons/bi';
import UserModal from '@/components/admin/users/UserModal';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'client' | 'staff';
  is_active: boolean;
  last_login: string;
  created_at: string;
}

export default function UsersPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ total: 0, byRole: [] });

  useEffect(() => {
    if (socket && isConnected) {
      loadUsers();
      loadStats();
    }
  }, [socket, isConnected]);

  const loadUsers = useCallback(() => {
    socket?.emit('get-users', {}, (res: any) => {
      if (res.success) {
        setUsers(res.data);
      }
      setLoading(false);
    });
  }, [socket]);

  const loadStats = useCallback(() => {
    socket?.emit('get-user-statistics', {}, (res: any) => {
      if (res.success) {
        setStats(res.data);
      }
    });
  }, [socket]);

  const handleCreateUser = (data: any) => {
    socket?.emit('register', data, (res: any) => {
      if (res.success) {
        success('Thêm người dùng thành công');
        setIsModalOpen(false);
        loadUsers();
        loadStats();
      } else {
        error(res.error || 'Không thể thêm người dùng');
      }
    });
  };

  const handleUpdateUser = (data: any) => {
    socket?.emit('update-user', { id: editingUser?.id, ...data }, (res: any) => {
      if (res.success) {
        success('Cập nhật người dùng thành công');
        setIsModalOpen(false);
        setEditingUser(null);
        loadUsers();
        loadStats();
      } else {
        error(res.error || 'Không thể cập nhật người dùng');
      }
    });
  };

  const handleDeleteUser = (user: User) => {
    if (user.role === 'admin') {
      error('Không thể xóa tài khoản admin');
      return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.full_name}"?`)) {
      socket?.emit('delete-user', { id: user.id }, (res: any) => {
        if (res.success) {
          success('Xóa người dùng thành công');
          loadUsers();
          loadStats();
        } else {
          error(res.error || 'Không thể xóa người dùng');
        }
      });
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = !user.is_active;
    socket?.emit('update-user', { 
      id: user.id, 
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      is_active: newStatus 
    }, (res: any) => {
      if (res.success) {
        success(newStatus ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản');
        loadUsers();
        loadStats();
      } else {
        error(res.error || 'Không thể cập nhật trạng thái');
      }
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Admin</span>;
      case 'staff':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Nhân viên</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Khách hàng</span>;
    }
  };

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang kết nối đến server...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Quản lý người dùng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý tài khoản admin, nhân viên và khách hàng</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
        >
          <BiPlus size={20} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng người dùng</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.total}</p>
            </div>
            <BiUser className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        {stats.byRole.map((item: any) => (
          <div key={item.role} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.role === 'admin' ? 'Admin' : item.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">{item.count}</p>
              </div>
              {item.role === 'admin' ? (
                <BiUserCheck className="h-8 w-8 text-purple-500" />
              ) : item.role === 'staff' ? (
                <BiUserPlus className="h-8 w-8 text-blue-500" />
              ) : (
                <BiUser className="h-8 w-8 text-emerald-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, tên đăng nhập hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vai trò</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="admin">Admin</option>
              <option value="staff">Nhân viên</option>
              <option value="client">Khách hàng</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800">
          <BiUserX className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên đăng nhập</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">{user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">{user.phone || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {user.is_active ? 'Hoạt động' : 'Khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <BiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa"
                        disabled={user.role === 'admin'}
                      >
                        <BiTrash className="h-5 w-5" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
      />
    </div>
  );
}
