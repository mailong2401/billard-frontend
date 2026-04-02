'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import BookingList from '@/components/admin/bookings/BookingList';
import { Booking } from '@/types';

export default function BookingsPage() {
  const { emit, on, off, isConnected } = useSocket();
  const { success, error } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  
  const isMounted = useRef(true);
  const initialLoaded = useRef(false);
  const isUpdatingRef = useRef(false);

  // ✅ LOAD LẦN ĐẦU - CHỈ 1 LẦN DUY NHẤT
  useEffect(() => {
    isMounted.current = true;

    if (isConnected && !initialLoaded.current) {
      initialLoaded.current = true;
      loadBookings();
    }

    return () => {
      isMounted.current = false;
    };
  }, [isConnected]);

  // Hàm load bookings - CHỈ GỌI KHI CẦN THIẾT
  const loadBookings = () => {
    if (!isMounted.current || isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setLoading(true);
    
    emit('get-bookings', { filters: { date: filterDate } }, (response: any) => {
      if (!isMounted.current) {
        isUpdatingRef.current = false;
        return;
      }
      
      if (response.success) {
        setBookings(response.data);
      } else {
        error(response.error || 'Không thể tải danh sách đặt bàn');
      }
      setLoading(false);
      isUpdatingRef.current = false;
    });
  };

  // 🔥 RELOAD KHI ĐỔI NGÀY - NHƯNG CÓ DEBOUNCE
  useEffect(() => {
    if (!isConnected || !initialLoaded.current) return;
    
    // Debounce để tránh gọi nhiều lần khi chọn ngày
    const timer = setTimeout(() => {
      loadBookings();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filterDate, isConnected]);

  // 🔥 REALTIME BOOKINGS - CHỈ UPDATE STATE, KHÔNG EMIT
  useEffect(() => {
    const handleNewBooking = (booking: Booking) => {
      // Chỉ cập nhật nếu booking thuộc ngày đang xem
      const bookingDate = booking.start_time.split(' ')[0];
      if (bookingDate === filterDate) {
        setBookings((prev) => [booking, ...prev]);
      }
    };

    const handleBookingUpdated = (updated: Booking) => {
      const bookingDate = updated.start_time.split(' ')[0];
      if (bookingDate === filterDate) {
        setBookings((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
      } else if (bookingDate !== filterDate) {
        // Nếu booking không còn thuộc ngày hiện tại, xóa khỏi danh sách
        setBookings((prev) => prev.filter((b) => b.id !== updated.id));
      }
    };

    const handleBookingCancelled = (booking: Booking) => {
      const bookingDate = booking.start_time.split(' ')[0];
      if (bookingDate === filterDate) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' } : b))
        );
      }
    };

    on('new-booking', handleNewBooking);
    on('booking-updated', handleBookingUpdated);
    on('booking-cancelled', handleBookingCancelled);

    return () => {
      off('new-booking', handleNewBooking);
      off('booking-updated', handleBookingUpdated);
      off('booking-cancelled', handleBookingCancelled);
    };
  }, [on, off, filterDate]);

  // ✅ ACTIONS - KHÔNG GỌI loadBookings TRONG CALLBACK
  const handleCheckIn = (id: number) => {
    emit('check-in', { id }, (response: any) => {
      if (response.success) {
        success('Check-in thành công');
      } else {
        error(response.error || 'Check-in thất bại');
      }
    });
  };

  const handleCheckOut = (id: number) => {
    const actualEndTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    emit('check-out', { id, actualEndTime }, (response: any) => {
      if (response.success) {
        success('Check-out thành công');
      } else {
        error(response.error || 'Check-out thất bại');
      }
    });
  };

  const handleCancelBooking = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn hủy đặt bàn này?')) {
      emit('cancel-booking', { id, reason: 'Khách hủy' }, (response: any) => {
        if (response.success) {
          success('Hủy đặt bàn thành công');
        } else {
          error(response.error || 'Hủy đặt bàn thất bại');
        }
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang kết nối đến server...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">Quản lý đặt bàn</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Xem và xử lý các đơn đặt bàn</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chọn ngày
        </label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-colors cursor-pointer"
        />
      </div>

      <BookingList
        bookings={bookings}
        loading={loading}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onCancel={handleCancelBooking}
      />
    </div>
  );
}
