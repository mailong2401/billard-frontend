'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { BiSearch, BiUser, BiPhone, BiEnvelope, BiCalendar, BiHistory } from 'react-icons/bi';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

interface Customer {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
}

interface Booking {
  id: number;
  booking_code: string;
  table_name: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
}

export default function StaffCustomersPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadCustomers = useCallback(() => {
    socket?.emit('get-users', { filters: { role: 'client' } }, (res: any) => {
      if (res.success) {
        setCustomers(res.data);
      }
      setLoading(false);
    });
  }, [socket]);

  useEffect(() => {
    if (isClient && socket && isConnected) {
      loadCustomers();
    }
  }, [isClient, socket, isConnected, loadCustomers]);

  // Realtime updates
  useEffect(() => {
    if (!socket || !isClient) return;

    const handleUserUpdated = (updatedUser: Customer) => {
      if (updatedUser.role === 'client') {
        setCustomers(prev => prev.map(c => c.id === updatedUser.id ? updatedUser : c));
      }
    };

    socket.on('user-updated', handleUserUpdated);

    return () => {
      socket.off('user-updated', handleUserUpdated);
    };
  }, [socket, isClient]);

  const loadCustomerBookings = (customer: Customer) => {
    socket?.emit('get-bookings', { filters: { customer_phone: customer.phone } }, (res: any) => {
      if (res.success) {
        setCustomerBookings(res.data);
        setSelectedCustomer(customer);
        setShowBookingModal(true);
      } else {
        error('Không thể tải lịch sử đặt bàn');
      }
    });
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm));
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', text: 'Chờ xác nhận' },
      confirmed: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400', text: 'Đã xác nhận' },
      checked_in: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', text: 'Đang chơi' },
      completed: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400', text: 'Hoàn thành' },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', text: 'Đã hủy' }
    };
    const info = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>{info.text}</span>;
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

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
          Danh sách khách hàng
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Quản lý thông tin và lịch sử đặt bàn của khách hàng
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-black dark:text-white">{customers.length}</p>
              </div>
              <BiUser className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Đang hoạt động</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {customers.filter(c => c.is_active).length}
                </p>
              </div>
              <BiUser className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Đã khóa</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {customers.filter(c => !c.is_active).length}
                </p>
              </div>
              <BiUser className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, tên đăng nhập, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            />
          </div>
        </div>

        {/* Customers Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800">
            <BiUser className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Không tìm thấy khách hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Họ tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên đăng nhập</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số điện thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">{customer.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">{customer.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">{customer.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">{customer.phone || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.is_active 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {customer.is_active ? 'Hoạt động' : 'Khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                      {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => loadCustomerBookings(customer)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <BiHistory className="h-4 w-4" />
                        Lịch sử
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking History Modal */}
      {showBookingModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-black rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white">
                  Lịch sử đặt bàn
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCustomer.full_name} - {selectedCustomer.phone}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedCustomer(null);
                  setCustomerBookings([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {customerBookings.length === 0 ? (
                <div className="text-center py-8">
                  <BiCalendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Chưa có lịch sử đặt bàn</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-black dark:text-white">
                            {booking.table_name || `Bàn #${booking.table_id}`}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Mã: {booking.booking_code}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Thời gian:</span>
                          <p className="text-black dark:text-white">{formatDateTime(booking.start_time)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Thành tiền:</span>
                          <p className="font-semibold text-sky-600 dark:text-sky-400">
                            {formatCurrency(booking.total_amount || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedCustomer(null);
                  setCustomerBookings([]);
                }}
                className="px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
