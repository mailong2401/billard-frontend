'use client';

import { Booking } from '@/types';
import { BOOKING_STATUS } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { BiCheckCircle, BiXCircle, BiLogIn, BiLogOut } from 'react-icons/bi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  onCheckIn: (id: number) => void;
  onCheckOut: (id: number) => void;
  onCancel: (id: number) => void;
}

export default function BookingList({ bookings, loading, onCheckIn, onCheckOut, onCancel }: BookingListProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (bookings.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500 dark:text-macchiato-subtext">Không có đặt bàn nào trong ngày này</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-macchiato-surface">
          <thead className="bg-gray-50 dark:bg-macchiato-mantle">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-macchiato-subtext uppercase tracking-wider">
                Mã đặt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-macchiato-subtext uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-macchiato-subtext uppercase tracking-wider">
                Bàn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-macchiato-subtext uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-macchiato-subtext uppercase tracking-wider">
                Thành tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-macchiato-subtext uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-macchiato-subtext uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-macchiato-base divide-y divide-gray-200 dark:divide-macchiato-surface">
            {bookings.map((booking) => {
              const status = BOOKING_STATUS[booking.status];
              return (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-macchiato-mantle transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-macchiato-text">
                    {booking.booking_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-macchiato-text">{booking.customer_name}</div>
                    <div className="text-sm text-gray-500 dark:text-macchiato-subtext">{booking.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-macchiato-text">
                    {booking.table_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-macchiato-text">{formatDateTime(booking.start_time)}</div>
                    <div className="text-sm text-gray-500 dark:text-macchiato-subtext">đến {formatDateTime(booking.end_time)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-macchiato-text">
                    {formatCurrency(booking.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => onCheckIn(booking.id)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Check-in"
                        >
                          <BiLogIn className="h-5 w-5" />
                        </button>
                      )}
                      {booking.status === 'checked_in' && (
                        <button
                          onClick={() => onCheckOut(booking.id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-macchiato-blue dark:hover:text-blue-300 transition-colors"
                          title="Check-out"
                        >
                          <BiLogOut className="h-5 w-5" />
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => onCancel(booking.id)}
                          className="text-red-600 hover:text-red-800 dark:text-macchiato-red dark:hover:text-red-300 transition-colors"
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
  );
}
