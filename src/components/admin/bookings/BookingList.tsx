'use client';

import { useState } from 'react';
import { Booking } from '@/types';
import { BOOKING_STATUS } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { BiCheckCircle, BiXCircle, BiLogIn, BiLogOut, BiInfoCircle } from 'react-icons/bi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BookingDetailModal from '@/components/admin/bookings/BookingDetailModal';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  onCheckIn: (id: number) => void;
  onCheckOut: (id: number) => void;
  onCancel: (id: number) => void;
}

export default function BookingList({ bookings, loading, onCheckIn, onCheckOut, onCancel }: BookingListProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Không có đặt bàn nào trong ngày này</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mã đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bàn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thành tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
              {bookings.map((booking) => {
                const status = BOOKING_STATUS[booking.status];
                return (
                  <tr 
                    key={booking.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(booking)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">
                      {booking.booking_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black dark:text-white">{booking.customer_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                      {booking.table_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black dark:text-white">{formatDateTime(booking.start_time)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">đến {formatDateTime(booking.end_time)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                      {formatCurrency(booking.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewDetail(booking)}
                          className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
                          title="Xem chi tiết"
                        >
                          <BiInfoCircle className="h-5 w-5" />
                        </button>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => onCheckIn(booking.id)}
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                            title="Check-in"
                          >
                            <BiLogIn className="h-5 w-5" />
                          </button>
                        )}
                        {booking.status === 'checked_in' && (
                          <button
                            onClick={() => onCheckOut(booking.id)}
                            className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
                            title="Check-out"
                          >
                            <BiLogOut className="h-5 w-5" />
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => onCancel(booking.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Hủy"
                          >
                            <BiXCircle className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chi tiết */}
      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </>
  );
}
