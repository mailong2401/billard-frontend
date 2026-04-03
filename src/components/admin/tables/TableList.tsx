'use client';

import { useState, memo } from 'react';
import { Table } from '@/types';
import TableCard from './TableCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BiSearch } from 'react-icons/bi';

interface TableListProps {
  tables: Table[];
  loading: boolean;
  onEdit: (table: Table) => void;
  onDelete: (id: number) => void;
  onBook: (table: Table) => void;
  onPlayDirect?: (table: Table, customerName: string, customerPhone: string) => void;
  onPlay?: (table: Table, bookingId: number) => void;
  onEnd?: (table: Table, bookingId: number) => void;
  onOrder?: (table: Table, bookingId: number) => void;
  activeBookings?: Map<number, { 
    id: number; 
    start_time: string; 
    current_amount: number; 
    hours_played: number;
    customer_name?: string;
    customer_phone?: string;
    food_total?: number;
    total_amount?: number;
  }>;
}

const TableList = memo(function TableList({ 
  tables, 
  loading, 
  onEdit, 
  onDelete, 
  onBook, 
  onPlayDirect,
  onPlay, 
  onEnd,
  onOrder,
  activeBookings = new Map()
}: TableListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          table.table_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || table.table_type === filterType;
    const matchesStatus = filterStatus === 'all' || table.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Thống kê nhanh */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng bàn', value: stats.total },
          { label: 'Trống', value: stats.available },
          { label: 'Đang chơi', value: stats.occupied },
          { label: 'Đã đặt', value: stats.reserved },
        ].map((stat, index) => (
          <div key={stat.label} className={`bg-white dark:bg-black text-black dark:text-white border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center transition-colors`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-macchiato-subtext h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm bàn theo tên hoặc số bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-black text-gray-900 dark:text-macchiato-text"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Loại bàn</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-black text-black dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="standard">Standard</option>
              <option value="vip">VIP</option>
              <option value="tournament">Tournament</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-black text-black dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="available">Trống</option>
              <option value="occupied">Đang chơi</option>
              <option value="reserved">Đã đặt</option>
              <option value="maintenance">Bảo trì</option>
              <option value="cleaning">Đang dọn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table grid */}
      {filteredTables.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-500 dark:text-macchiato-subtext">Không tìm thấy bàn nào</p>
          <p className="text-sm text-gray-400 dark:text-macchiato-subtext/70 mt-1">
            Thử tìm kiếm với từ khóa khác hoặc thêm bàn mới
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500 dark:text-macchiato-subtext">
            Hiển thị {filteredTables.length} / {tables.length} bàn
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map((table) => (
              <TableCard
                key={`${table.id}-${table.status}-${activeBookings.get(table.id)?.id || 'no-booking'}`}
                table={table}
                onEdit={onEdit}
                onDelete={onDelete}
                onBook={onBook}
                onPlayDirect={onPlayDirect}
                onPlay={onPlay}
                onEnd={onEnd}
                onOrder={onOrder}
                activeBooking={activeBookings.get(table.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default TableList;
