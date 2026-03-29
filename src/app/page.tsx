'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { BiTable, BiCalendar, BiDollar, BiUser } from 'react-icons/bi';
import { useSocket } from '@/hooks/useSocket';
import { Table, Booking } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

export default function Home() {
  const { socket, isConnected } = useSocket();
  const [tables, setTables] = useState<Table[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false); // ✅ Thêm state
  
  const isMounted = useRef(true);
  const initialized = useRef(false);

  // ✅ Đánh dấu đã mount ở client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ CHỈ LOAD DATA SAU KHI ĐÃ MOUNT Ở CLIENT
  useEffect(() => {
    isMounted.current = true;

    if (isClient && socket && isConnected && !initialized.current) {
      initialized.current = true;
      console.log('🏠 Home: Initialized, loading data...');
      
      socket.emit('get-tables', {}, (res: any) => {
        if (!isMounted.current) return;
        if (res.success) {
          setTables(res.data);
        }
      });

      const today = new Date().toISOString().slice(0, 10);
      socket.emit('get-bookings', { filters: { date: today } }, (res: any) => {
        if (!isMounted.current) return;
        if (res.success) {
          setBookings(res.data);
          setRecentBookings(res.data.slice(0, 5));
        }
        setLoading(false);
      });
    }

    return () => {
      isMounted.current = false;
    };
  }, [isClient, socket, isConnected]);

  // 🔥 LẮNG NGHE REALTIME EVENTS
  useEffect(() => {
    if (!socket || !isClient) return;

    console.log('🏠 Home: Setting up realtime listeners');

    // TABLE EVENTS
    const handleTableCreated = (table: Table) => {
      console.log('📊 Home: Table created realtime', table);
      setTables((prev) => [...prev, table]);
    };

    const handleTableUpdated = (updated: Table) => {
      console.log('📊 Home: Table updated realtime', updated);
      setTables((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    };

    const handleTableDeleted = ({ id }: { id: number }) => {
      console.log('📊 Home: Table deleted realtime', id);
      setTables((prev) => prev.filter((t) => t.id !== id));
    };

    // BOOKING EVENTS
    const handleNewBooking = (booking: Booking) => {
      console.log('📊 Home: New booking realtime', booking);
      
      const today = new Date().toISOString().slice(0, 10);
      const bookingDate = booking.start_time?.split(' ')[0] || '';
      
      if (bookingDate === today) {
        setBookings((prev) => {
          if (prev.some(b => b.id === booking.id)) return prev;
          return [booking, ...prev];
        });
        
        setRecentBookings((prev) => {
          if (prev.some(b => b.id === booking.id)) return prev;
          return [booking, ...prev].slice(0, 5);
        });
      }
      
      if (booking.table_id) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === booking.table_id 
              ? { ...t, status: 'reserved' } 
              : t
          )
        );
      }
    };

    const handleBookingUpdated = (updated: Booking) => {
      console.log('📊 Home: Booking updated realtime', updated);
      
      const today = new Date().toISOString().slice(0, 10);
      const bookingDate = updated.start_time?.split(' ')[0] || '';
      
      if (bookingDate === today) {
        setBookings((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
        setRecentBookings((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
      } else {
        setBookings((prev) => prev.filter((b) => b.id !== updated.id));
        setRecentBookings((prev) => prev.filter((b) => b.id !== updated.id));
      }
      
      if (updated.table_id) {
        let newStatus = 'available';
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
      console.log('📊 Home: Booking cancelled realtime', booking);
      
      const today = new Date().toISOString().slice(0, 10);
      const bookingDate = booking.start_time?.split(' ')[0] || '';
      
      if (bookingDate === today) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' } : b))
        );
        setRecentBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' } : b))
        );
      }
      
      if (booking.table_id) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === booking.table_id 
              ? { ...t, status: 'available' } 
              : t
          )
        );
      }
    };

    socket.on('table-created', handleTableCreated);
    socket.on('table-updated', handleTableUpdated);
    socket.on('table-deleted', handleTableDeleted);
    socket.on('table-status-changed', handleTableUpdated);
    socket.on('new-booking', handleNewBooking);
    socket.on('booking-updated', handleBookingUpdated);
    socket.on('booking-cancelled', handleBookingCancelled);

    return () => {
      console.log('🏠 Home: Cleaning up realtime listeners');
      socket.off('table-created', handleTableCreated);
      socket.off('table-updated', handleTableUpdated);
      socket.off('table-deleted', handleTableDeleted);
      socket.off('table-status-changed', handleTableUpdated);
      socket.off('new-booking', handleNewBooking);
      socket.off('booking-updated', handleBookingUpdated);
      socket.off('booking-cancelled', handleBookingCancelled);
    };
  }, [socket, isClient]);

  const totalTables = tables.length;
  const availableTables = tables.filter(t => t.status === 'available').length;
  const todayBookings = bookings.length;
  const todayRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.total_amount, 0);

  // ✅ Hiển thị loading cho đến khi client mount xong
  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kết nối đến server...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng số bàn',
      value: totalTables,
      icon: BiTable,
      color: 'bg-blue-500',
      link: '/tables'
    },
    {
      title: 'Bàn trống',
      value: availableTables,
      icon: BiTable,
      color: 'bg-green-500',
      link: '/tables'
    },
    {
      title: 'Đặt bàn hôm nay',
      value: todayBookings,
      icon: BiCalendar,
      color: 'bg-purple-500',
      link: '/bookings'
    },
    {
      title: 'Doanh thu hôm nay',
      value: formatCurrency(todayRevenue),
      icon: BiDollar,
      color: 'bg-yellow-500',
      link: '/bookings'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan về hệ thống quản lý bàn bi da</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link href={stat.link} key={index}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Truy cập nhanh</h2>
          <div className="space-y-3">
            <Link
              href="/tables"
              className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <BiTable className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Quản lý bàn</p>
                <p className="text-sm text-gray-600">Xem và quản lý danh sách bàn</p>
              </div>
            </Link>
            <Link
              href="/bookings"
              className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <BiCalendar className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Quản lý đặt bàn</p>
                <p className="text-sm text-gray-600">Xem và xử lý đặt bàn</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Đặt bàn gần đây</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có đặt bàn nào hôm nay</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <Link href={`/bookings`} key={booking.id}>
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <BiUser className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{booking.customer_name}</p>
                        <p className="text-sm text-gray-500">
                          {booking.table_name || `Bàn #${booking.table_id}`} - {formatDateTime(booking.start_time)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(booking.total_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.status === 'completed' ? 'Hoàn thành' : 
                         booking.status === 'checked_in' ? 'Đang chơi' : 
                         booking.status === 'confirmed' ? 'Đã đặt' : 'Đã hủy'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
