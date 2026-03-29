'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import TableList from '@/components/tables/TableList';
import CreateTableModal from '@/components/tables/CreateTableModal';
import EditTableModal from '@/components/tables/EditTableModal';
import BookingForm from '@/components/bookings/BookingForm';
import { Table, CreateTableData, UpdateTableData } from '@/types';
import { BiPlus } from 'react-icons/bi';

export default function TablesPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false); // ✅ Thêm state để kiểm tra client

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const isMounted = useRef(true);
  const initialized = useRef(false);

  // ✅ Đánh dấu đã mount ở client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ CHỈ LOAD DATA SAU KHI ĐÃ MOUNT Ở CLIENT
  useEffect(() => {
    isMounted.current = true;

    if (isClient && socket && isConnected && !initialized.current) {
      initialized.current = true;
      console.log('📋 Tables: Initialized, loading tables...');
      
      socket.emit('get-tables', {}, (res: any) => {
        if (!isMounted.current) return;

        if (res.success) {
          setTables(res.data);
        } else {
          error(res.error);
        }
        setLoading(false);
      });
    }

    return () => {
      isMounted.current = false;
    };
  }, [isClient, socket, isConnected, error]); // ✅ Thêm isClient vào dependency

  // 🔥 LẮNG NGHE REALTIME EVENTS
  useEffect(() => {
    if (!socket || !isClient) return; // ✅ Chỉ chạy khi đã mount ở client

    console.log('📋 Tables: Setting up realtime listeners');

    const handleCreated = (table: Table) => {
      console.log('📋 Tables: Table created realtime', table);
      setTables((prev) => [...prev, table]);
    };

    const handleUpdated = (updated: Table) => {
      console.log('📋 Tables: Table updated realtime', updated);
      setTables((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    };

    const handleDeleted = ({ id }: { id: number }) => {
      console.log('📋 Tables: Table deleted realtime', id);
      setTables((prev) => prev.filter((t) => t.id !== id));
    };

    const handleBookingChange = (updated: Table) => {
      console.log('📋 Tables: Booking changed table realtime', updated);
      setTables((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    };

    socket.on('table-created', handleCreated);
    socket.on('table-updated', handleUpdated);
    socket.on('table-deleted', handleDeleted);
    socket.on('table-status-changed', handleUpdated);
    socket.on('booking-updated', handleBookingChange);
    socket.on('new-booking', handleBookingChange);

    return () => {
      console.log('📋 Tables: Cleaning up realtime listeners');
      socket.off('table-created', handleCreated);
      socket.off('table-updated', handleUpdated);
      socket.off('table-deleted', handleDeleted);
      socket.off('table-status-changed', handleUpdated);
      socket.off('booking-updated', handleBookingChange);
      socket.off('new-booking', handleBookingChange);
    };
  }, [socket, isClient]); // ✅ Thêm isClient vào dependency

  const handleCreateTable = (data: CreateTableData) => {
    socket?.emit('create-table', data, (res: any) => {
      if (res.success) {
        success('Thêm bàn thành công');
        setIsCreateModalOpen(false);
      } else {
        error(res.error);
      }
    });
  };

  const handleUpdateTable = (data: UpdateTableData) => {
    socket?.emit('update-table', data, (res: any) => {
      if (res.success) {
        success('Cập nhật thành công');
        setIsEditModalOpen(false);
      } else {
        error(res.error);
      }
    });
  };

  const handleDeleteTable = (id: number) => {
    if (!confirm('Xóa bàn?')) return;

    socket?.emit('delete-table', { id }, (res: any) => {
      if (res.success) {
        success('Đã xóa');
      } else {
        error(res.error);
      }
    });
  };

  const handleBookTable = (data: any) => {
    socket?.emit('create-booking', data, (res: any) => {
      if (res.success) {
        success('Đặt bàn thành công');
        setIsBookingModalOpen(false);
      } else {
        error(res.error);
      }
    });
  };

  // ✅ Hiển thị loading cho đến khi client mount xong
  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kết nối đến server...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Quản lý bàn</h1>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <BiPlus />
          Thêm bàn
        </button>
      </div>

      <TableList
        tables={tables}
        loading={loading}
        onEdit={(t) => {
          setSelectedTable(t);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDeleteTable}
        onBook={(t) => {
          setSelectedTable(t);
          setIsBookingModalOpen(true);
        }}
      />

      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTable}
      />

      <EditTableModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateTable}
        table={selectedTable}
      />

      <BookingForm
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleBookTable}
        table={selectedTable}
      />
    </div>
  );
}
