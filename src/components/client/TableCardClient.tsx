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
}

export default function TableCardClient({ table }: TableCardClientProps) {
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
      case 'vip': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'tournament': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const isAvailable = table.status === 'available';

  return (
    <>
      <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text">
                {table.table_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-macchiato-subtext">
                {table.table_number}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTableTypeColor(table.table_type)}`}>
              {getTableTypeLabel(table.table_type)}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-macchiato-subtext">Giá:</span>
              <span className="font-medium text-primary-600">
                {formatCurrency(table.price_per_hour)} / giờ
              </span>
            </div>
            {table.location && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-macchiato-subtext">Vị trí:</span>
                <span className="font-medium text-gray-900 dark:text-macchiato-text">
                  {table.location}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-macchiato-subtext">Trạng thái:</span>
              <span className={`font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? 'Trống' : 'Đang sử dụng'}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            {isAvailable ? (
              <>
                <Link
                  href={`/client/booking?tableId=${table.id}`}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition"
                >
                  <BiCalendar className="h-4 w-4" />
                  <span>Đặt bàn</span>
                </Link>
                <Link
                  href={`/client/play?tableId=${table.id}`}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition"
                >
                  <BiPlay className="h-4 w-4" />
                  <span>Play ngay</span>
                </Link>
              </>
            ) : (
              <button
                disabled
                className="w-full px-3 py-2 rounded-md text-sm font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
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
