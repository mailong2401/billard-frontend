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
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500">Không có đặt bàn nào trong ngày này</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đặt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bàn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thành tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => {
              const status = BOOKING_STATUS[booking.status];
              return (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.booking_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                    <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.table_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDateTime(booking.start_time)}</div>
                    <div className="text-sm text-gray-500">đến {formatDateTime(booking.end_time)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                          className="text-green-600 hover:text-green-800"
                          title="Check-in"
                        >
                          <BiLogIn className="h-5 w-5" />
                        </button>
                      )}
                      {booking.status === 'checked_in' && (
                        <button
                          onClick={() => onCheckOut(booking.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Check-out"
                        >
                          <BiLogOut className="h-5 w-5" />
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => onCancel(booking.id)}
                          className="text-red-600 hover:text-red-800"
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
