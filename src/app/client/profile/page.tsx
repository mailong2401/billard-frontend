'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/client/Header';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { BiUser, BiPhone, BiCalendar, BiHistory, BiLogOut } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

interface Booking {
  id: number;
  booking_code: string;
  table_id: number;
  table_name: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_amount: number;
  status: string;
  notes?: string;
}

export default function ClientProfile() {
  const { socket, isConnected } = useSocket();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && socket && isConnected && user) {
      socket?.emit('get-bookings', { 
        filters: { customer_phone: user.phone || '' } 
      }, (res: any) => {
        if (res.success) {
          setBookings(res.data);
        }
        setLoading(false);
      });
    } else if (isClient && !user && !loading) {
      router.push('/auth/login');
    }
  }, [isClient, socket, isConnected, user, router]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', text: 'Chờ xác nhận' },
      confirmed: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400', text: 'Đã xác nhận' },
      checked_in: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', text: 'Đang chơi' },
      completed: { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400', text: 'Hoàn thành' },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', text: 'Đã hủy' }
    };
    const info = statusMap[status] || { color: 'bg-slate-100 text-slate-800', text: status };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>{info.text}</span>;
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!isClient || !isConnected) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 dark:border-sky-400"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">Vui lòng đăng nhập để xem thông tin</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) => {
  const amount = Number(b.total_amount);
  return sum + (isNaN(amount) ? 0 : amount);
}, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Hồ sơ của tôi
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
          >
            <BiLogOut className="h-5 w-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Quản lý thông tin và lịch sử đặt bàn
        </p>

        {/* Customer Info */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <BiUser className="mr-2" /> Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-500 dark:text-slate-400">Họ tên</label>
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                {user.full_name || 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-500 dark:text-slate-400">Tên đăng nhập</label>
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                {user.username}
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-500 dark:text-slate-400">Email</label>
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                {user.email || 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-500 dark:text-slate-400">Số điện thoại</label>
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                {user.phone || 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-black dark:text-white">
              {bookings.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tổng đặt bàn
            </p>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-black dark:text-white">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tổng chi tiêu
            </p>
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <BiHistory className="mr-2" /> Lịch sử đặt bàn
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <BiCalendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                Chưa có lịch sử đặt bàn
              </p>
              <button
                onClick={() => router.push('/client/tables')}
                className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition"
              >
                Đặt bàn ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {booking.table_name || `Bàn #${booking.table_id}`}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Mã: {booking.booking_code}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Thời gian:</span>
                      <p className="text-slate-900 dark:text-white">{formatDateTime(booking.start_time)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Số giờ:</span>
                      <p className="text-slate-900 dark:text-white">{booking.duration_hours} giờ</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Thành tiền:</span>
                      <p className="font-semibold text-sky-600 dark:text-sky-400">
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                    {booking.notes && (
                      <div className="col-span-2">
                        <span className="text-slate-500 dark:text-slate-400">Ghi chú:</span>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
