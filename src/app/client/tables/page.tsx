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
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Danh sách bàn
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Chọn bàn phù hợp để trải nghiệm
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
  
  <div className="bg-black border border-gray-700 rounded-lg p-3 text-center hover:border-gray-500 transition">
    <p className="text-2xl font-bold text-sky-400">{stats.total}</p>
    <p className="text-xs text-slate-400">Tổng bàn</p>
  </div>

  <div className="bg-black border border-gray-700 rounded-lg p-3 text-center hover:border-gray-500 transition">
    <p className="text-2xl font-bold text-emerald-400">{stats.available}</p>
    <p className="text-xs text-slate-400">Trống</p>
  </div>

  <div className="bg-black border border-gray-700 rounded-lg p-3 text-center hover:border-gray-500 transition">
    <p className="text-2xl font-bold text-purple-400">{stats.vip}</p>
    <p className="text-xs text-slate-400">VIP</p>
  </div>

</div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 dark:border-sky-400"></div>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy bàn nào</p>
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
