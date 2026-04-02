'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BiX, BiUser, BiPhone, BiCalendar, BiTime, BiDollar, BiNote, BiFoodMenu } from 'react-icons/bi';
import { Booking, BookingItem } from '@/types';
import { BOOKING_STATUS } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function BookingDetailModal({ isOpen, onClose, booking }: BookingDetailModalProps) {
  if (!booking) return null;

  const status = BOOKING_STATUS[booking.status];

  // Tính tổng tiền món
  const totalFoodAmount = booking.items?.reduce((sum, item) => {
  const subtotal = Number(item.subtotal) || 0;
  return sum + subtotal;
}, 0) || 0;
  const grandTotal = (booking.total_amount || 0) + totalFoodAmount;

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
      case 'preparing':
        return { label: 'Đang chuẩn bị', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'served':
        return { label: 'Đã phục vụ', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
      case 'cancelled':
        return { label: 'Đã hủy', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' };
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-black p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-black dark:text-white">
                    Chi tiết đặt bàn
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-all hover:scale-110"
                  >
                    <BiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  {/* Header info */}
                  <div className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Mã đặt bàn</p>
                      <p className="text-lg font-bold text-black dark:text-white">{booking.booking_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin khách hàng */}
                  <div>
                    <h4 className="text-md font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                      <BiUser className="h-5 w-5" /> Thông tin khách hàng
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Họ tên</p>
                        <p className="font-medium text-black dark:text-white">{booking.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại</p>
                        <p className="font-medium text-black dark:text-white">{booking.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin đặt bàn */}
                  <div>
                    <h4 className="text-md font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                      <BiCalendar className="h-5 w-5" /> Thông tin đặt bàn
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Bàn</p>
                        <p className="font-medium text-black dark:text-white">{booking.table_name || `Bàn #${booking.table_id}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loại bàn</p>
                        <p className="font-medium text-black dark:text-white">{booking.table_type || 'Standard'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian bắt đầu</p>
                        <p className="font-medium text-black dark:text-white">{formatDateTime(booking.start_time)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian kết thúc</p>
                        <p className="font-medium text-black dark:text-white">{formatDateTime(booking.end_time)}</p>
                      </div>
                      {booking.duration_hours > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Số giờ</p>
                          <p className="font-medium text-black dark:text-white">{booking.duration_hours} giờ</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danh sách món đã gọi - BOOKING ITEMS */}
                  <div>
                    <h4 className="text-md font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                      <BiFoodMenu className="h-5 w-5" /> Danh sách món đã gọi
                    </h4>
                    {booking.items && booking.items.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Tên món
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Số lượng
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Đơn giá
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {booking.items.map((item: BookingItem) => {
                              const itemStatus = getItemStatusBadge(item.status);
                              return (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                  <td className="px-4 py-3 text-sm text-black dark:text-white">
                                    {item.product_name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center text-black dark:text-white">
                                    {item.quantity}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-black dark:text-white">
                                    {formatCurrency(item.price)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-medium text-black dark:text-white">
                                    {formatCurrency(item.subtotal)}
                                  </td>

                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-black dark:text-white">
                                Tổng tiền món:
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(totalFoodAmount)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                        <p className="text-gray-500 dark:text-gray-400">Chưa có món nào được gọi</p>
                      </div>
                    )}
                  </div>

                  {/* Thông tin thanh toán tổng hợp */}
                  <div>
                    <h4 className="text-md font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                      <BiDollar className="h-5 w-5" /> Thông tin thanh toán
                    </h4>
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Tiền bàn:</span>
                        <span className="font-medium text-black dark:text-white">{formatCurrency(booking.total_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Tiền đồ ăn/uống:</span>
                        <span className="font-medium text-black dark:text-white">{formatCurrency(totalFoodAmount)}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-black dark:text-white">Tổng cộng:</span>
                          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú */}
                  {booking.notes && (
                    <div>
                      <h4 className="text-md font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                        <BiNote className="h-5 w-5" /> Ghi chú
                      </h4>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300">{booking.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Thời gian tạo */}
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-right pt-2 border-t border-gray-200 dark:border-gray-800">
                    Tạo lúc: {formatDateTime(booking.created_at)}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Đóng
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
