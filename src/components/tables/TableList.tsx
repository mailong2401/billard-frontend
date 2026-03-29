'use client';

import { useState, useEffect } from 'react';
import { Table } from '@/types';
import TableCard from './TableCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BiSearch, BiFilter } from 'react-icons/bi';

interface TableListProps {
  tables: Table[];
  loading: boolean;
  onEdit: (table: Table) => void;
  onDelete: (id: number) => void;
  onBook: (table: Table) => void;
}

export default function TableList({ tables, loading, onEdit, onDelete, onBook }: TableListProps) {
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại bàn</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="standard">Standard</option>
              <option value="vip">VIP</option>
              <option value="tournament">Tournament</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy bàn nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onEdit={onEdit}
              onDelete={onDelete}
              onBook={onBook}
            />
          ))}
        </div>
      )}
    </div>
  );
}
