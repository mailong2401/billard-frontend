'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BiCalendar, BiPlay } from 'react-icons/bi';
import { formatCurrency } from '@/utils/formatters';

interface TableCardClientProps {
  table: {
    id: number;
    table_number: string;
    table_name: string;
    table_type: string;
    price_per_hour: number;
    status: string;
    location?: string;
  };
  onBook?: () => void;  // Thêm prop onBook
}

export default function TableCardClient({ table, onBook }: TableCardClientProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const getTableTypeLabel = (type: string) => {
    switch (type) {
      case 'vip': return 'VIP';
      case 'tournament': return 'Tournament';
      default: return 'Standard';
    }
  };

  const getTableTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30';
      case 'tournament': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30';
      default: return 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30';
    }
  };

  const isAvailable = table.status === 'available';

  return (
    <>
      <div className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-gray-200 dark:border-gray-800">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white">
                {table.table_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{table.table_number}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTableTypeColor(table.table_type)}`}>
              {getTableTypeLabel(table.table_type)}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Giá:</span>
              <span className="font-medium text-black dark:text-white">
                {formatCurrency(table.price_per_hour)} / giờ
              </span>
            </div>
            {table.location && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Vị trí:</span>
                <span className="font-medium text-black dark:text-white">{table.location}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
              <span className={`font-medium ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isAvailable ? 'Trống' : 'Đang sử dụng'}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            {isAvailable ? (
              <button
                onClick={onBook}
                className="w-full flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <BiCalendar className="h-4 w-4" />
                <span>Đặt bàn</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              >
                Đang sử dụng
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
