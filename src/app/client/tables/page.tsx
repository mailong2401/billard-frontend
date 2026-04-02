'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import Header from '@/components/client/Header';
import TableCardClient from '@/components/client/TableCardClient';
import { BiSearch } from 'react-icons/bi';

export default function ClientTables() {
  const { socket, isConnected } = useSocket();
  const [tables, setTables] = useState<any[]>([]);
  const [filteredTables, setFilteredTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadTables = useCallback(() => {
    socket?.emit('get-tables', {}, (res: any) => {
      if (res.success) {
        setTables(res.data);
        setFilteredTables(res.data);
      }
      setLoading(false);
    });
  }, [socket]);

  useEffect(() => {
    if (isClient && socket && isConnected) {
      loadTables();
    }
  }, [isClient, socket, isConnected, loadTables]);

  useEffect(() => {
    let filtered = tables;
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.table_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.table_type === filterType);
    }
    
    setFilteredTables(filtered);
  }, [searchTerm, filterType, tables]);

  if (!isClient || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    vip: tables.filter(t => t.table_type === 'vip').length,
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-macchiato-text mb-2">
          Danh sách bàn
        </h1>
        <p className="text-gray-600 dark:text-macchiato-subtext mb-6">
          Chọn bàn phù hợp để trải nghiệm
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-600 dark:text-macchiato-subtext">Tổng bàn</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            <p className="text-xs text-gray-600 dark:text-macchiato-subtext">Trống</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.vip}</p>
            <p className="text-xs text-gray-600 dark:text-macchiato-subtext">VIP</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-macchiato-surface rounded-lg bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md bg-white dark:bg-macchiato-base"
            >
              <option value="all">Tất cả</option>
              <option value="standard">Standard</option>
              <option value="vip">VIP</option>
              <option value="tournament">Tournament</option>
            </select>
          </div>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-macchiato-subtext">Không tìm thấy bàn nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map((table) => (
              <TableCardClient key={table.id} table={table} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
