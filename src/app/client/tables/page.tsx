'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/client/Header';
import TableCardClient from '@/components/client/TableCardClient';
import BookingForm from '@/components/client/BookingForm';
import { BiSearch } from 'react-icons/bi';

export default function ClientTables() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();
  const { user } = useAuth();
  const [tables, setTables] = useState<any[]>([]);
  const [filteredTables, setFilteredTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isClient, setIsClient] = useState(false);
  
  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);

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

  // Initial load
  useEffect(() => {
    if (isClient && socket && isConnected) {
      loadTables();
    }
  }, [isClient, socket, isConnected, loadTables]);

  // ================= REALTIME UPDATES =================
  useEffect(() => {
    if (!socket || !isClient) return;

    const handleTableCreated = (newTable: any) => {
      setTables(prev => [newTable, ...prev]);
    };

    const handleTableUpdated = (updatedTable: any) => {
      setTables(prev => prev.map(t => 
        t.id === updatedTable.id ? updatedTable : t
      ));
    };

    const handleTableDeleted = ({ tableId }: { tableId: number }) => {
      setTables(prev => prev.filter(t => t.id !== tableId));
    };

    const handleTableStatusChanged = (updatedTable: any) => {
      setTables(prev => prev.map(t => 
        t.id === updatedTable.id ? updatedTable : t
      ));
    };

    const handleNewBooking = (booking: any) => {
      if (booking.table_id) {
        setTables(prev => prev.map(t =>
          t.id === booking.table_id
            ? { ...t, status: 'reserved' }
            : t
        ));
      }
    };

    const handleBookingUpdated = (updated: any) => {
      if (updated.table_id) {
        let newStatus = 'available';
        if (updated.status === 'checked_in') newStatus = 'occupied';
        else if (updated.status === 'confirmed') newStatus = 'reserved';
        else if (updated.status === 'completed') newStatus = 'available';
        else if (updated.status === 'cancelled') newStatus = 'available';
        
        setTables(prev => prev.map(t =>
          t.id === updated.table_id
            ? { ...t, status: newStatus }
            : t
        ));
      }
    };

    socket.on('table-created', handleTableCreated);
    socket.on('table-updated', handleTableUpdated);
    socket.on('table-deleted', handleTableDeleted);
    socket.on('table-status-changed', handleTableStatusChanged);
    socket.on('new-booking', handleNewBooking);
    socket.on('booking-updated', handleBookingUpdated);
    socket.on('booking-cancelled', handleBookingUpdated);

    return () => {
      socket.off('table-created', handleTableCreated);
      socket.off('table-updated', handleTableUpdated);
      socket.off('table-deleted', handleTableDeleted);
      socket.off('table-status-changed', handleTableStatusChanged);
      socket.off('new-booking', handleNewBooking);
      socket.off('booking-updated', handleBookingUpdated);
      socket.off('booking-cancelled', handleBookingUpdated);
    };
  }, [socket, isClient]);

  const handleBookTable = (data: any) => {
    socket?.emit('create-booking', data, (res: any) => {
      if (res.success) {
        success(`Đặt bàn thành công! Bàn ${selectedTable?.table_name}`);
        setIsBookingModalOpen(false);
        setSelectedTable(null);
        loadTables();
      } else {
        error(res.error || 'Không thể đặt bàn');
      }
    });
  };

  // Filter tables
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
      <div className="min-h-screen bg-white dark:bg-black">
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
          Chọn bàn phù hợp để đặt trước
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center hover:border-gray-300 dark:hover:border-gray-500 transition">
            <p className="text-2xl font-bold text-black dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Tổng bàn</p>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center hover:border-gray-300 dark:hover:border-gray-500 transition">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.available}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Trống</p>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center hover:border-gray-300 dark:hover:border-gray-500 transition">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.vip}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">VIP</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              <TableCardClient 
                key={table.id} 
                table={table}
                onBook={() => {
                  setSelectedTable(table);
                  setIsBookingModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal - với thông tin user cố định */}
      {isBookingModalOpen && selectedTable && user && (
        <BookingForm
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedTable(null);
          }}
          onSubmit={handleBookTable}
          table={selectedTable}
          defaultCustomerName={user.full_name || user.username}
          defaultCustomerPhone={user.phone || ''}
          isReadOnly={true}
        />
      )}
    </div>
  );
}
