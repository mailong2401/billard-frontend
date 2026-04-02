'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import TableList from '@/components/tables/TableList';
import CreateTableModal from '@/components/tables/CreateTableModal';
import EditTableModal from '@/components/tables/EditTableModal';
import BookingForm from '@/components/bookings/BookingForm';
import OrderPanel from '@/components/orders/OrderPanel';
import { Table, CreateTableData, UpdateTableData } from '@/types';
import { BiPlus } from 'react-icons/bi';

const getVietnamTime = (): string => {
  const now = new Date();
  const vietnamOffset = 7 * 60 * 60 * 1000;
  const vietnamTime = new Date(now.getTime() + vietnamOffset);
  return vietnamTime.toISOString().slice(0, 19).replace('T', ' ');
};

const getVietnamDate = (): Date => {
  const now = new Date();
  const vietnamOffset = 7 * 60 * 60 * 1000;
  return new Date(now.getTime() + vietnamOffset);
};

const toNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function TablesPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [activeBookings, setActiveBookings] = useState<Map<number, any>>(new Map());

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ table: Table; bookingId: number } | null>(null);

  const isMounted = useRef(true);
  const initialized = useRef(false);
  const realtimeInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ================= LOAD TABLES =================
  const loadTables = useCallback(() => {
    socket?.emit('get-tables-full', {}, (res: any) => {
      if (!isMounted.current) return;

      if (res.success) {
        setTables(res.data);

        const bookingsMap = new Map<number, any>();

        res.data.forEach((table: any) => {
          if (table.booking_id) {
            const startTime = new Date(table.start_time);
            const now = new Date();

            const hoursPlayed = Math.max(
              0,
              (now.getTime() - startTime.getTime()) / (1000 * 60 * 60)
            );

            const currentAmount =
              Math.ceil(hoursPlayed) * table.price_per_hour;

            bookingsMap.set(table.id, {
              id: table.booking_id,
              start_time: table.start_time,
              current_amount: currentAmount,
              hours_played: hoursPlayed,
              customer_name: table.customer_name,
              customer_phone: table.customer_phone,
              food_total: toNumber(table.food_total || 0),
              total_amount:
                currentAmount + toNumber(table.food_total || 0),
            });
          }
        });

        setActiveBookings(bookingsMap);
      } else {
        error(res.error);
      }

      setLoading(false);
    });
  }, [socket, error]);

  // ================= INIT =================
  useEffect(() => {
    isMounted.current = true;

    if (isClient && socket && isConnected && !initialized.current) {
      initialized.current = true;
      loadTables();
    }

    return () => {
      isMounted.current = false;
      if (realtimeInterval.current) clearInterval(realtimeInterval.current);
    };
  }, [isClient, socket, isConnected, loadTables]);

  // ================= REALTIME AMOUNT UPDATER =================
  useEffect(() => {
    if (!socket || !isClient) return;

    if (realtimeInterval.current) {
      clearInterval(realtimeInterval.current);
    }

    realtimeInterval.current = setInterval(() => {
      setActiveBookings(prev => {
        const newMap = new Map(prev);

        newMap.forEach((booking, tableId) => {
          if (!booking?.start_time) return;

          const table = tables.find(t => t.id === tableId);
          if (!table) return;

          const startTime = new Date(booking.start_time);
          const now = new Date();

          const hoursPlayed = Math.max(
            0,
            (now.getTime() - startTime.getTime()) / (1000 * 60 * 60)
          );

          const currentAmount =
            Math.ceil(hoursPlayed) * table.price_per_hour;

          newMap.set(tableId, {
            ...booking,
            current_amount: currentAmount,
            hours_played: hoursPlayed,
            total_amount:
              currentAmount + (booking.food_total || 0),
          });
        });

        return newMap;
      });
    }, 1000);

    return () => {
      if (realtimeInterval.current) clearInterval(realtimeInterval.current);
    };
  }, [socket, isClient, tables]);

  // ================= ACTIONS =================
  const handlePlay = useCallback((table: Table, bookingId: number) => {
    socket?.emit('get-bookings', {
      filters: { table_id: table.id, status: 'confirmed' }
    }, (res: any) => {
      if (res.success && res.data.length > 0) {
        const booking = res.data[0];

        socket?.emit('check-in', { id: booking.id }, (checkInRes: any) => {
          if (checkInRes.success) {
            success(`Bắt đầu chơi! Bàn ${table.table_name} - Khách: ${booking.customer_name}`);
            setTimeout(() => loadTables(), 500);
          } else {
            error(checkInRes.error);
          }
        });
      } else {
        error('Không tìm thấy booking cho bàn này');
      }
    });
  }, [socket, success, error, loadTables]);

  const handleEnd = useCallback((table: Table, bookingId: number) => {
    const actualEndTime = getVietnamTime();

    socket?.emit('check-out', { id: bookingId, actualEndTime }, (res: any) => {
      if (res.success) {
        const totalAmount = res.data.total_amount;
        success(`Kết thúc! Bàn ${table.table_name} - Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} VNĐ`);
        setTimeout(() => loadTables(), 500);
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error, loadTables]);

  const handlePlayDirect = useCallback((table: Table, customerName: string, customerPhone: string) => {
    const startTime = getVietnamTime();
    const vietnamDate = getVietnamDate();
    const endTime = new Date(vietnamDate.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    
    const bookingData = {
      table_id: table.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      start_time: startTime,
      end_time: endTime,
      duration_hours: 0,
      total_amount: 0,
      notes: 'Play ngay'
    };
    
    socket?.emit('create-booking', bookingData, (res: any) => {
      if (res.success) {
        const bookingId = res.data.id;
        socket?.emit('update-booking', { id: bookingId, status: 'confirmed' }, (updateRes: any) => {
          if (updateRes.success) {
            socket?.emit('check-in', { id: bookingId }, (checkInRes: any) => {
              if (checkInRes.success) {
                success(`Bắt đầu chơi! Bàn ${table.table_name} - Khách: ${customerName}`);
                setTimeout(() => loadTables(), 500);
              } else {
                error(checkInRes.error || 'Không thể bắt đầu chơi');
              }
            });
          } else {
            error('Không thể xác nhận đặt bàn');
          }
        });
      } else {
        error(res.error || 'Không thể tạo đặt bàn');
      }
    });
  }, [socket, success, error, loadTables]);

  const handleOrder = useCallback((table: Table, bookingId: number) => {
    setSelectedOrder({ table, bookingId });
    setIsOrderPanelOpen(true);
  }, []);

  const handleCreateTable = useCallback((data: CreateTableData) => {
    socket?.emit('create-table', data, (res: any) => {
      if (res.success) {
        success('Thêm bàn thành công');
        setIsCreateModalOpen(false);
        loadTables();
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error, loadTables]);

  const handleUpdateTable = useCallback((data: UpdateTableData) => {
    socket?.emit('update-table', data, (res: any) => {
      if (res.success) {
        success('Cập nhật thành công');
        setIsEditModalOpen(false);
        loadTables();
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error, loadTables]);

  const handleDeleteTable = useCallback((id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bàn này?')) return;
    socket?.emit('delete-table', { id }, (res: any) => {
      if (res.success) {
        success('Đã xóa bàn');
        loadTables();
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error, loadTables]);

  const handleBookTable = useCallback((data: any) => {
    socket?.emit('create-booking', data, (res: any) => {
      if (res.success) {
        success('Đặt bàn thành công');
        setIsBookingModalOpen(false);
        loadTables();
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error, loadTables]);

  // ================= SOCKET SYNC =================
  useEffect(() => {
    if (!socket) return;

    const refresh = () => loadTables();

    socket.on('table-created', refresh);
    socket.on('table-updated', refresh);
    socket.on('table-deleted', refresh);
    socket.on('table-status-changed', refresh);
    socket.on('booking-updated', refresh);
    socket.on('booking-cancelled', refresh);
    socket.on('new-booking', refresh);

    return () => {
      socket.off('table-created', refresh);
      socket.off('table-updated', refresh);
      socket.off('table-deleted', refresh);
      socket.off('table-status-changed', refresh);
      socket.off('booking-updated', refresh);
      socket.off('booking-cancelled', refresh);
      socket.off('new-booking', refresh);
    };
  }, [socket, loadTables]);

  // ================= UI =================
  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-macchiato-subtext">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-macchiato-subtext">Đang kết nối đến server...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-macchiato-text">Quản lý bàn</h1>
          <p className="text-gray-600 dark:text-macchiato-subtext mt-1">Quản lý bàn bi da và theo dõi thời gian chơi</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <BiPlus size={20} />
          <span>Thêm bàn</span>
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
        onPlayDirect={handlePlayDirect}
        onPlay={handlePlay}
        onEnd={handleEnd}
        onOrder={handleOrder}
        activeBookings={activeBookings}
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

      {isOrderPanelOpen && selectedOrder && (
        <OrderPanel
          isOpen={isOrderPanelOpen}
          onClose={() => setIsOrderPanelOpen(false)}
          tableId={selectedOrder.table.id}
          bookingId={selectedOrder.bookingId}
          tableName={selectedOrder.table.table_name}
          socket={socket}
          onOrderUpdate={() => {
            if (selectedOrder) {
              setTimeout(() => loadTables(), 500);
            }
          }}
        />
      )}
    </div>
  );
}
