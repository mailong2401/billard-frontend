'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import TableList from '@/components/admin/tables/TableList';
import CreateTableModal from '@/components/admin/tables/CreateTableModal';
import EditTableModal from '@/components/admin/tables/EditTableModal';
import BookingForm from '@/components/admin/bookings/BookingForm';
import OrderPanel from '@/components/admin/tables/OrderPanel';
import { Table, CreateTableData, UpdateTableData } from '@/types';
import { BiPlus } from 'react-icons/bi';

// Helper: Chuyển đổi string datetime sang Date object
const parseDateTime = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [datePart, timePart] = dateStr.split(' ');
  if (!timePart) return new Date(dateStr);
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
};

const getVietnamTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
  const isUpdating = useRef(false); // Thêm flag để tránh cập nhật trùng lặp

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ================= LOAD TABLES =================
  const loadTables = useCallback(() => {
    if (isUpdating.current) return;
    isUpdating.current = true;
    
    socket?.emit('get-tables-full', {}, (res: any) => {
      if (!isMounted.current) {
        isUpdating.current = false;
        return;
      }

      if (res.success) {
        setTables(res.data);

        const bookingsMap = new Map<number, any>();

        res.data.forEach((table: any) => {
          if (table.booking_id) {
            const startTime = table.start_time ? parseDateTime(table.start_time) : null;
            const now = new Date();
            let hoursPlayed = 0;
            let currentAmount = 0;
            
            if (table.status === 'occupied' && startTime) {
              const diffMs = now.getTime() - startTime.getTime();
              hoursPlayed = Math.max(0, diffMs / (1000 * 60 * 60));
              currentAmount = Math.ceil(hoursPlayed) * table.price_per_hour;
            }
            
            bookingsMap.set(table.id, {
              id: table.booking_id,
              start_time: table.start_time,
              current_amount: currentAmount,
              hours_played: hoursPlayed,
              customer_name: table.customer_name,
              customer_phone: table.customer_phone,
              food_total: toNumber(table.food_total || 0),
              total_amount: currentAmount + toNumber(table.food_total || 0),
            });
          }
        });

        setActiveBookings(bookingsMap);
      } else {
        error(res.error);
      }

      setLoading(false);
      isUpdating.current = false;
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
        let hasChanges = false;

        newMap.forEach((booking, tableId) => {
          if (!booking?.start_time) return;

          const table = tables.find(t => t.id === tableId);
          if (!table) return;

          const startTime = parseDateTime(booking.start_time);
          const now = new Date();
          const diffMs = now.getTime() - startTime.getTime();
          const hoursPlayed = Math.max(0, diffMs / (1000 * 60 * 60));
          const currentAmount = Math.ceil(hoursPlayed) * table.price_per_hour;

          if (booking.current_amount !== currentAmount) {
            hasChanges = true;
            newMap.set(tableId, {
              ...booking,
              current_amount: currentAmount,
              hours_played: hoursPlayed,
              total_amount: currentAmount + (booking.food_total || 0),
            });
          }
        });

        return hasChanges ? newMap : prev;
      });
    }, 1000);

    return () => {
      if (realtimeInterval.current) clearInterval(realtimeInterval.current);
    };
  }, [socket, isClient, tables]);

  // ================= REALTIME UPDATES (giống ClientTables) =================
  useEffect(() => {
    if (!socket || !isClient) return;

    // Các handler cập nhật state trực tiếp, không gọi loadTables()
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

    // Đăng ký listeners
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

  // ================= ACTIONS =================
  const handlePlay = useCallback((table: Table, bookingId: number) => {
    if (bookingId && bookingId > 0) {
      socket?.emit('check-in', { id: bookingId }, (checkInRes: any) => {
        if (checkInRes.success) {
          success(`Bắt đầu chơi! Bàn ${table.table_name}`);
          // Không gọi loadTables, event từ server sẽ cập nhật
        } else {
          error(checkInRes.error || 'Không thể bắt đầu chơi');
        }
      });
      return;
    }
    
    socket?.emit('get-bookings', {
      filters: { table_id: table.id }
    }, (res: any) => {
      if (res.success && res.data.length > 0) {
        const booking = res.data.find((b: any) => 
          b.status === 'confirmed' || b.status === 'pending'
        );
        
        if (booking) {
          if (booking.status === 'pending') {
            socket?.emit('update-booking', { id: booking.id, status: 'confirmed' }, (updateRes: any) => {
              if (updateRes.success) {
                socket?.emit('check-in', { id: booking.id }, (checkInRes: any) => {
                  if (checkInRes.success) {
                    success(`Bắt đầu chơi! Bàn ${table.table_name} - Khách: ${booking.customer_name}`);
                  } else {
                    error(checkInRes.error || 'Không thể bắt đầu chơi');
                  }
                });
              } else {
                error('Không thể xác nhận đặt bàn');
              }
            });
          } else {
            socket?.emit('check-in', { id: booking.id }, (checkInRes: any) => {
              if (checkInRes.success) {
                success(`Bắt đầu chơi! Bàn ${table.table_name} - Khách: ${booking.customer_name}`);
              } else {
                error(checkInRes.error || 'Không thể bắt đầu chơi');
              }
            });
          }
        } else {
          error('Không tìm thấy booking hợp lệ cho bàn này');
        }
      } else {
        error('Không tìm thấy booking cho bàn này. Vui lòng đặt bàn trước khi bắt đầu.');
      }
    });
  }, [socket, success, error]);

  const handleEnd = useCallback((table: Table, bookingId: number) => {
    const actualEndTime = getVietnamTime();

    socket?.emit('check-out', { id: bookingId, actualEndTime }, (res: any) => {
      if (res.success) {
        const totalAmount = res.data.total_amount;
        success(`Kết thúc! Bàn ${table.table_name} - Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} VNĐ`);
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error]);

  const handlePlayDirect = useCallback((table: Table, customerName: string, customerPhone: string) => {
    const startTime = getVietnamTime();
    const startDate = parseDateTime(startTime);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const endTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
    
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
  }, [socket, success, error]);

  const handleOrder = useCallback((table: Table, bookingId: number) => {
    setSelectedOrder({ table, bookingId });
    setIsOrderPanelOpen(true);
  }, []);

  const handleCreateTable = useCallback((data: CreateTableData) => {
    socket?.emit('create-table', data, (res: any) => {
      if (res.success) {
        success('Thêm bàn thành công');
        setIsCreateModalOpen(false);
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error]);

  const handleUpdateTable = useCallback((data: UpdateTableData) => {
    socket?.emit('update-table', data, (res: any) => {
      if (res.success) {
        success('Cập nhật thành công');
        setIsEditModalOpen(false);
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error]);

  const handleDeleteTable = useCallback((id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bàn này?')) return;
    socket?.emit('delete-table', { id }, (res: any) => {
      if (res.success) {
        success('Đã xóa bàn');
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error]);

  const handleBookTable = useCallback((data: any) => {
    socket?.emit('create-booking', data, (res: any) => {
      if (res.success) {
        success('Đặt bàn thành công');
        setIsBookingModalOpen(false);
        setSelectedTable(null);
      } else {
        error(res.error);
      }
    });
  }, [socket, success, error]);

  // ================= UI =================
  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang kết nối đến server...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Quản lý bàn
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý bàn bi da và theo dõi thời gian chơi
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg border border-gray-300 dark:border-gray-600 hover:opacity-80 transition"
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
              // Không gọi loadTables, event từ server sẽ cập nhật
            }
          }}
        />
      )}
    </div>
  );
}
