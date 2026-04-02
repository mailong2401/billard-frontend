'use client';

import { useState, useEffect, memo } from 'react';
import { Table } from '@/types';
import { TABLE_STATUS, TABLE_TYPE } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';
import { BiEdit, BiTrash, BiCalendar, BiPlay, BiStopwatch, BiTime, BiCoffee } from 'react-icons/bi';

interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (id: number) => void;
  onBook: (table: Table) => void;
  onPlayDirect?: (table: Table, customerName: string, customerPhone: string) => void;
  onPlay?: (table: Table, bookingId: number) => void;
  onEnd?: (table: Table, bookingId: number) => void;
  onOrder?: (table: Table, bookingId: number) => void;
  activeBooking?: {
    id: number;
    start_time: string;
    current_amount: number;
    hours_played: number;
    customer_name?: string;
    customer_phone?: string;
    food_total?: number;
    total_amount?: number;
  } | null;
}

// Hàm format thời gian chi tiết
const formatDuration = (hours: number): string => {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const TableCard = memo(function TableCard({ 
  table, 
  onEdit, 
  onDelete, 
  onBook, 
  onPlayDirect,
  onPlay, 
  onEnd,
  onOrder,
  activeBooking 
}: TableCardProps) {
  const status = TABLE_STATUS[table.status];
  const type = TABLE_TYPE[table.table_type];
  const [currentAmount, setCurrentAmount] = useState(activeBooking?.current_amount || 0);
  const [hoursPlayed, setHoursPlayed] = useState(activeBooking?.hours_played || 0);
  const [showPlayDirectModal, setShowPlayDirectModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [localFoodTotal, setLocalFoodTotal] = useState(activeBooking?.food_total || 0);
  const [durationText, setDurationText] = useState('00:00');

  // Update local state when activeBooking changes
  useEffect(() => {
    if (activeBooking) {
      setCurrentAmount(activeBooking.current_amount || 0);
      setHoursPlayed(activeBooking.hours_played || 0);
      setLocalFoodTotal(activeBooking.food_total || 0);
    }
  }, [activeBooking]);

  // Real-time timer for occupied tables - cập nhật mỗi giây
  useEffect(() => {
    if (table.status === 'occupied' && activeBooking?.start_time) {
      const interval = setInterval(() => {
        const start = new Date(activeBooking.start_time);
        const now = new Date();
        const hours = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60));
        const amount = Math.ceil(hours) * table.price_per_hour;
        
        setHoursPlayed(hours);
        setCurrentAmount(amount);
        setDurationText(formatDuration(hours));
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    } else if (activeBooking?.hours_played) {
      setDurationText(formatDuration(activeBooking.hours_played));
    }
  }, [table.status, activeBooking?.start_time, table.price_per_hour, activeBooking?.hours_played]);

  const isPlaying = table.status === 'occupied';
  const isReserved = table.status === 'reserved';
  const isAvailable = table.status === 'available';

  const handlePlayDirect = () => {
    if (customerName && customerPhone) {
      onPlayDirect?.(table, customerName, customerPhone);
      setShowPlayDirectModal(false);
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  const tableAmount = currentAmount;
  const foodAmount = localFoodTotal || activeBooking?.food_total || 0;
  const totalCurrentAmount = tableAmount + foodAmount;

  const getStatusColor = (statusCode: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      occupied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      maintenance: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      cleaning: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[statusCode] || colors.available;
  };

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text">
                {table.table_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-macchiato-subtext">{table.table_number}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
              {status.label}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-macchiato-subtext">Loại bàn:</span>
              <span className="font-medium text-gray-900 dark:text-macchiato-text">{type.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-macchiato-subtext">Giá:</span>
              <span className="font-medium text-primary-600 dark:text-macchiato-blue">
                {formatCurrency(table.price_per_hour)} / giờ
              </span>
            </div>
            {table.location && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-macchiato-subtext">Vị trí:</span>
                <span className="font-medium text-gray-900 dark:text-macchiato-text">{table.location}</span>
              </div>
            )}
          </div>

          {isPlaying && activeBooking && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <BiTime className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Đang chơi</span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  Bắt đầu: {new Date(activeBooking.start_time).toLocaleTimeString()}
                </span>
              </div>
              {activeBooking.customer_name && (
                <div className="text-xs text-gray-600 dark:text-macchiato-subtext mb-2">
                  Khách: {activeBooking.customer_name} - {activeBooking.customer_phone}
                </div>
              )}
              
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-xs text-gray-600 dark:text-macchiato-subtext">Thời gian đã chơi</p>
                  <p className="text-lg font-bold font-mono text-green-700 dark:text-green-400">
                    {durationText}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-macchiato-subtext">Tiền bàn</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(tableAmount)}
                  </p>
                </div>
              </div>

              {foodAmount > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-800">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-macchiato-subtext">Tiền đồ ăn/uống</p>
                    <p className="text-md font-semibold text-orange-600 dark:text-macchiato-peach">
                      {formatCurrency(foodAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-macchiato-subtext">Tổng cộng</p>
                    <p className="text-xl font-bold text-red-600 dark:text-macchiato-red">
                      {formatCurrency(totalCurrentAmount)}
                    </p>
                  </div>
                </div>
              )}

              {foodAmount === 0 && (
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 dark:text-macchiato-subtext">Chưa có đồ ăn/uống</p>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            {isAvailable && onPlayDirect && (
              <button
                onClick={() => setShowPlayDirectModal(true)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                <BiPlay className="h-4 w-4" />
                <span>Play ngay</span>
              </button>
            )}

            {isAvailable && (
              <button
                onClick={() => onBook(table)}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-macchiato-text bg-gray-100 dark:bg-macchiato-surface hover:bg-gray-200 dark:hover:bg-macchiato-overlay transition-colors"
                title="Đặt bàn"
              >
                <BiCalendar className="h-4 w-4" />
              </button>
            )}

            {isReserved && onPlay && (
              <button
                onClick={() => onPlay(table, 0)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
              >
                <BiPlay className="h-4 w-4" />
                <span>Play</span>
              </button>
            )}

            {isPlaying && onOrder && activeBooking && (
              <button
                onClick={() => onOrder(table, activeBooking.id)}
                className="px-3 py-2 rounded-md text-sm font-medium text-orange-700 dark:text-macchiato-peach bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                title="Gọi đồ"
              >
                <BiCoffee className="h-4 w-4" />
              </button>
            )}

            {isPlaying && onEnd && activeBooking && (
              <button
                onClick={() => onEnd(table, activeBooking.id)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <BiStopwatch className="h-4 w-4" />
                <span>Kết thúc</span>
              </button>
            )}

            {!isPlaying && (
              <>
                <button
                  onClick={() => onEdit(table)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-macchiato-text bg-gray-100 dark:bg-macchiato-surface hover:bg-gray-200 dark:hover:bg-macchiato-overlay transition-colors"
                  title="Sửa"
                >
                  <BiEdit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(table.id)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-700 dark:text-macchiato-red bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  title="Xóa"
                >
                  <BiTrash className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal nhập thông tin khách cho Play ngay */}
      {showPlayDirectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-macchiato-base rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text mb-4">
                🎱 Play ngay - {table.table_name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                    placeholder="Nhập tên khách hàng"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-macchiato-blue">
                    💰 Giá: {formatCurrency(table.price_per_hour)} VNĐ/giờ
                  </p>
                  <p className="text-xs text-blue-600 dark:text-macchiato-subtext mt-1">
                    ⏱️ Thời gian sẽ được tính từ lúc bắt đầu (tính theo giờ, làm tròn lên)
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowPlayDirectModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md text-gray-700 dark:text-macchiato-text hover:bg-gray-50 dark:hover:bg-macchiato-surface transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handlePlayDirect}
                    disabled={!customerName || !customerPhone}
                    className={`flex-1 px-4 py-2 rounded-md text-white transition-colors ${
                      customerName && customerPhone
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Bắt đầu chơi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default TableCard;
