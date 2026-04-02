'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import Header from '@/components/client/Header';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { BiUser, BiPhone, BiCalendar, BiHistory } from 'react-icons/bi';

interface Booking {
  id: number;
  booking_code: string;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && socket && isConnected) {
      // Load customer info from localStorage
      const savedName = localStorage.getItem('customer_name');
      const savedPhone = localStorage.getItem('customer_phone');
      if (savedName) setCustomerInfo(prev => ({ ...prev, name: savedName }));
      if (savedPhone) setCustomerInfo(prev => ({ ...prev, phone: savedPhone }));

      // Load bookings
      socket?.emit('get-bookings', { 
        filters: { customer_phone: savedPhone || '' } 
      }, (res: any) => {
        if (res.success) {
          setBookings(res.data);
        }
        setLoading(false);
      });
    }
  }, [isClient, socket, isConnected]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xác nhận' },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Đã xác nhận' },
      checked_in: { color: 'bg-green-100 text-green-800', text: 'Đang chơi' },
      completed: { color: 'bg-gray-100 text-gray-800', text: 'Hoàn thành' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Đã hủy' }
    };
    const info = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>{info.text}</span>;
  };

  if (!isClient || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-macchiato-text mb-2">
          Hồ sơ của tôi
        </h1>
        <p className="text-gray-600 dark:text-macchiato-subtext mb-6">
          Quản lý thông tin và lịch sử đặt bàn
        </p>

        {/* Customer Info */}
        <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text mb-4 flex items-center">
            <BiUser className="mr-2" /> Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-macchiato-subtext">Họ tên</label>
              <p className="text-lg font-medium text-gray-900 dark:text-macchiato-text">
                {customerInfo.name || 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-macchiato-subtext">Số điện thoại</label>
              <p className="text-lg font-medium text-gray-900 dark:text-macchiato-text">
                {customerInfo.phone || 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
            <p className="text-sm text-gray-600 dark:text-macchiato-subtext">Tổng đặt bàn</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSpent)}</p>
            <p className="text-sm text-gray-600 dark:text-macchiato-subtext">Tổng chi tiêu</p>
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text mb-4 flex items-center">
            <BiHistory className="mr-2" /> Lịch sử đặt bàn
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <BiCalendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-macchiato-subtext">
                Chưa có lịch sử đặt bàn
              </p>
              <button
                onClick={() => window.location.href = '/client/tables'}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"
              >
                Đặt bàn ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 dark:border-macchiato-surface rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-macchiato-text">
                        {booking.table_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-macchiato-subtext">
                        Mã: {booking.booking_code}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                    <div>
                      <span className="text-gray-500">Thời gian:</span>
                      <p>{formatDateTime(booking.start_time)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Số giờ:</span>
                      <p>{booking.duration_hours} giờ</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Thành tiền:</span>
                      <p className="font-semibold text-primary-600">
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                    {booking.notes && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Ghi chú:</span>
                        <p className="text-gray-600 dark:text-macchiato-subtext text-sm">
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
