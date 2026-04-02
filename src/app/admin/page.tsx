'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BiTable, BiCalendar, BiDollar, BiUser, BiTrendingUp, BiCoffee, BiPlay } from 'react-icons/bi';
import { useSocket } from '@/hooks/useSocket';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

// Định nghĩa types
type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

interface Table {
  id: number;
  table_number: string;
  table_name: string;
  table_type: 'standard' | 'vip' | 'tournament';
  price_per_hour: number;
  status: TableStatus;
  description: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Booking {
  id: number;
  booking_code: string;
  table_id: number;
  table_name?: string;
  customer_name: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: BookingStatus;
  created_at: string;
}

export default function AdminDashboard() {
  const { socket, isConnected } = useSocket();
  const [tables, setTables] = useState<Table[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  const isMounted = useRef(true);
  const initialized = useRef(false);
  const realtimeInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ================= LOAD DATA =================
  const loadData = useCallback(() => {
    if (!socket) return;

    // Load tables với thông tin booking
    socket.emit('get-tables-full', {}, (res: any) => {
      if (!isMounted.current) return;
      if (res.success) {
        setTables(res.data);
      }
    });

    // Load today's bookings
    const today = new Date().toISOString().slice(0, 10);
    socket.emit('get-bookings', { filters: { date: today } }, (res: any) => {
      if (!isMounted.current) return;
      if (res.success) {
        setBookings(res.data);
        setRecentBookings(res.data.slice(0, 5));
      }
      setLoading(false);
    });
  }, [socket]);

  // ================= INIT =================
  useEffect(() => {
    isMounted.current = true;

    if (isClient && socket && isConnected && !initialized.current) {
      initialized.current = true;
      console.log('🏠 Admin Dashboard: Initialized, loading data...');
      loadData();
    }

    return () => {
      isMounted.current = false;
      if (realtimeInterval.current) clearInterval(realtimeInterval.current);
    };
  }, [isClient, socket, isConnected, loadData]);

  // ================= REALTIME UPDATES =================
  useEffect(() => {
    if (!socket || !isClient) return;

    console.log('🏠 Admin Dashboard: Setting up realtime listeners');

    const handleTableUpdated = (updated: Table) => {
      setTables((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    };

    const handleTableStatusChanged = (updated: Table) => {
      setTables((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    };

    const handleNewBooking = (booking: Booking) => {
      const today = new Date().toISOString().slice(0, 10);
      const bookingDate = booking.start_time?.split(' ')[0] || '';
      
      if (bookingDate === today) {
        setBookings((prev) => {
          if (prev.some(b => b.id === booking.id)) return prev;
          return [booking, ...prev];
        });
        
        setRecentBookings((prev) => {
          if (prev.some(b => b.id === booking.id)) return prev;
          const newList = [booking, ...prev].slice(0, 5);
          return newList;
        });
      }
      
      if (booking.table_id) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === booking.table_id 
              ? { ...t, status: 'reserved' as TableStatus }
              : t
          )
        );
      }
    };

    const handleBookingUpdated = (updated: Booking) => {
      const today = new Date().toISOString().slice(0, 10);
      const bookingDate = updated.start_time?.split(' ')[0] || '';
      
      if (bookingDate === today) {
        setBookings((prev) => {
          const index = prev.findIndex(b => b.id === updated.id);
          if (index === -1) return prev;
          const newList = [...prev];
          newList[index] = updated;
          return newList;
        });
        
        setRecentBookings((prev) => {
          const index = prev.findIndex(b => b.id === updated.id);
          if (index === -1) return prev;
          const newList = [...prev];
          newList[index] = updated;
          return newList;
        });
      } else {
        setBookings((prev) => prev.filter((b) => b.id !== updated.id));
        setRecentBookings((prev) => prev.filter((b) => b.id !== updated.id));
      }
      
      if (updated.table_id) {
        let newStatus: TableStatus = 'available';
        if (updated.status === 'checked_in') newStatus = 'occupied';
        else if (updated.status === 'confirmed') newStatus = 'reserved';
        else if (updated.status === 'completed') newStatus = 'available';
        else if (updated.status === 'cancelled') newStatus = 'available';
        
        setTables((prev) =>
          prev.map((t) =>
            t.id === updated.table_id 
              ? { ...t, status: newStatus }
              : t
          )
        );
      }
    };

    const handleBookingCancelled = (booking: Booking) => {
      const today = new Date().toISOString().slice(0, 10);
      const bookingDate = booking.start_time?.split(' ')[0] || '';
      
      if (bookingDate === today) {
        setBookings((prev) => {
          const index = prev.findIndex(b => b.id === booking.id);
          if (index === -1) return prev;
          const newList = [...prev];
          newList[index] = { ...newList[index], status: 'cancelled' };
          return newList;
        });
        
        setRecentBookings((prev) => {
          const index = prev.findIndex(b => b.id === booking.id);
          if (index === -1) return prev;
          const newList = [...prev];
          newList[index] = { ...newList[index], status: 'cancelled' };
          return newList;
        });
      }
      
      if (booking.table_id) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === booking.table_id 
              ? { ...t, status: 'available' as TableStatus }
              : t
          )
        );
      }
    };

    socket.on('table-updated', handleTableUpdated);
    socket.on('table-status-changed', handleTableStatusChanged);
    socket.on('new-booking', handleNewBooking);
    socket.on('booking-updated', handleBookingUpdated);
    socket.on('booking-cancelled', handleBookingCancelled);

    return () => {
      socket.off('table-updated', handleTableUpdated);
      socket.off('table-status-changed', handleTableStatusChanged);
      socket.off('new-booking', handleNewBooking);
      socket.off('booking-updated', handleBookingUpdated);
      socket.off('booking-cancelled', handleBookingCancelled);
    };
  }, [socket, isClient]);

  // Calculate statistics
  const totalTables = tables.length;
  const availableTables = tables.filter(t => t.status === 'available').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const todayBookings = bookings.length;
  const todayCompleted = bookings.filter(b => b.status === 'completed').length;
  const todayRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-macchiato-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-macchiato-subtext">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-macchiato-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-macchiato-subtext">Đang kết nối đến server...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng số bàn',
      value: totalTables,
      icon: BiTable,
      link: '/admin/tables'
    },
    {
      title: 'Bàn trống',
      value: availableTables,
      icon: BiTable,
      link: '/admin/tables'
    },
    {
      title: 'Đang chơi',
      value: occupiedTables,
      icon: BiPlay,
      link: '/admin/tables'
    },
    {
      title: 'Đã đặt',
      value: reservedTables,
      icon: BiCalendar,
      link: '/admin/bookings'
    },
    {
      title: 'Đặt bàn hôm nay',
      value: todayBookings,
      icon: BiCalendar,
      link: '/admin/bookings'
    },
    {
      title: 'Doanh thu hôm nay',
      value: formatCurrency(todayRevenue),
      icon: BiDollar,
      link: '/admin/reports'
    },
  ];

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-macchiato-green bg-green-50 dark:bg-green-900/20';
      case 'checked_in': return 'text-blue-600 dark:text-macchiato-blue bg-blue-50 dark:bg-blue-900/20';
      case 'confirmed': return 'text-yellow-600 dark:text-macchiato-yellow bg-yellow-50 dark:bg-yellow-900/20';
      case 'cancelled': return 'text-red-600 dark:text-macchiato-red bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 dark:text-macchiato-subtext bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'checked_in': return 'Đang chơi';
      case 'confirmed': return 'Đã đặt';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-macchiato-subtext mt-1">Tổng quan về hệ thống quản lý bàn bi da</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Link href={stat.link} key={index}>
              <div className="bg-white dark:bg-black border border-gray-400 dark:border-gray-400 rounded-lg shadow-md p-4 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-macchiato-subtext">{stat.title}</p>
                  <p className={`text-xl font-bold mt-1 text-black dark:text-white`}>{stat.value}</p>
                </div>
                <div className={`bg-black dark:bg-black border border-gray-200 dark:border-gray-700 p-2 rounded-full group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Access */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6">
  <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
    Truy cập nhanh
  </h2>

  <div className="space-y-3">
    
    <Link
      href="/admin/tables"
      className="flex items-center space-x-3 p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-all group"
    >
      <BiTable className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      <div>
        <p className="font-medium text-black dark:text-white">Quản lý bàn</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Xem và quản lý danh sách bàn
        </p>
      </div>
    </Link>

    <Link
      href="/admin/bookings"
      className="flex items-center space-x-3 p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-all group"
    >
      <BiCalendar className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      <div>
        <p className="font-medium text-black dark:text-white">Quản lý đặt bàn</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Xem và xử lý đặt bàn
        </p>
      </div>
    </Link>

    <Link
      href="/admin/products"
      className="flex items-center space-x-3 p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-all group"
    >
      <BiCoffee className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      <div>
        <p className="font-medium text-black dark:text-white">Quản lý sản phẩm</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Quản lý đồ ăn, thức uống
        </p>
      </div>
    </Link>

  </div>
</div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6">
  
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold text-black dark:text-white">
      Đặt bàn gần đây
    </h2>
    <Link
      href="/admin/bookings"
      className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
    >
      Xem tất cả
    </Link>
  </div>

  {loading ? (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
    </div>
  ) : recentBookings.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-8">
      <BiCalendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-500 dark:text-gray-400 text-center">
        Chưa có đặt bàn nào hôm nay
      </p>
    </div>
  ) : (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      
      {recentBookings.map((booking) => (
        <div key={booking.id}>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all">
            
            {/* Left */}
            <div className="flex items-center space-x-3">
              
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                <BiUser className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>

              <div>
                <p className="font-medium text-black dark:text-white">
                  {booking.customer_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {booking.table_name || `Bàn #${booking.table_id}`} - {formatDateTime(booking.start_time)}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="text-right">
              <p className="text-sm font-medium text-black dark:text-white">
                {formatCurrency(booking.total_amount || 0)}
              </p>
              <p className={`text-xs px-2 py-1 rounded-full mt-1 ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </p>
            </div>

          </div>

        </div>
      ))}

    </div>
  )}
</div>
      </div>

      {/* Table Status Summary */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6">
  
  <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
    Tình trạng bàn
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
    
    <div className="text-center p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition">
      <p className="text-2xl font-bold text-black dark:text-white">{availableTables}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">Trống</p>
    </div>

    <div className="text-center p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition">
      <p className="text-2xl font-bold text-black dark:text-white">{occupiedTables}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">Đang chơi</p>
    </div>

    <div className="text-center p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition">
      <p className="text-2xl font-bold text-black dark:text-white">{reservedTables}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">Đã đặt</p>
    </div>

    <div className="text-center p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition">
      <p className="text-2xl font-bold text-black dark:text-white">{totalTables}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số</p>
    </div>

    <div className="text-center p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition">
      <p className="text-2xl font-bold text-black dark:text-white">{todayCompleted}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">Đã kết thúc</p>
    </div>

  </div>
</div>
    </div>
  );
}
