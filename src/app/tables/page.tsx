'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import TableList from '@/components/tables/TableList';
import CreateTableModal from '@/components/tables/CreateTableModal';
import EditTableModal from '@/components/tables/EditTableModal';
import BookingForm from '@/components/bookings/BookingForm';
import OrderPanel from '@/components/orders/OrderPanel';
import { Table, CreateTableData, UpdateTableData } from '@/types';
import { BiPlus } from 'react-icons/bi';

// Hàm lấy thời gian hiện tại theo múi giờ Việt Nam (UTC+7)
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

// Helper function to ensure number
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
  
  // Order panel state
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ table: Table; bookingId: number } | null>(null);

  const isMounted = useRef(true);
  const initialized = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    if (isClient && socket && isConnected && !initialized.current) {
      initialized.current = true;
      loadTables();
    }
    return () => {
      isMounted.current = false;
    };
  }, [isClient, socket, isConnected]);

  const loadTables = () => {
    socket?.emit('get-tables', {}, (res: any) => {
      if (!isMounted.current) return;
      if (res.success) {
        setTables(res.data);
        res.data.forEach((table: Table) => {
          if (table.status === 'occupied') {
            getActiveBooking(table.id);
          }
        });
      } else {
        error(res.error);
      }
      setLoading(false);
    });
  };

  const getActiveBooking = (tableId: number) => {
    socket?.emit('get-bookings', { 
      filters: { table_id: tableId, status: 'checked_in' } 
    }, (res: any) => {
      if (res.success && res.data.length > 0) {
        const booking = res.data[0];
        setActiveBookings(prev => {
          const newMap = new Map(prev);
          newMap.set(tableId, {
            id: booking.id,
            start_time: booking.start_time,
            current_amount: 0,
            hours_played: 0,
            customer_name: booking.customer_name,
            customer_phone: booking.customer_phone,
            food_total: toNumber(booking.food_total || 0),
            total_amount: toNumber(booking.total_with_food || booking.total_amount || 0)
          });
          return newMap;
        });
      }
    });
  };

  const handlePlay = (table: Table, bookingId: number) => {
    socket?.emit('get-bookings', { 
      filters: { table_id: table.id, status: 'confirmed' } 
    }, (res: any) => {
      if (res.success && res.data.length > 0) {
        const booking = res.data[0];
        socket?.emit('check-in', { id: booking.id }, (checkInRes: any) => {
          if (checkInRes.success) {
            success(`Bắt đầu chơi! Bàn ${table.table_name} - Khách: ${booking.customer_name}`);
            setActiveBookings(prev => {
              const newMap = new Map(prev);
              newMap.set(table.id, {
                id: booking.id,
                start_time: getVietnamTime(),
                current_amount: 0,
                hours_played: 0,
                customer_name: booking.customer_name,
                customer_phone: booking.customer_phone,
                food_total: 0,
                total_amount: 0
              });
              return newMap;
            });
            setTables(prev => 
              prev.map(t => t.id === table.id ? { ...t, status: 'occupied' } : t)
            );
          } else {
            error(checkInRes.error || 'Không thể bắt đầu chơi');
          }
        });
      } else {
        error('Không tìm thấy booking cho bàn này');
      }
    });
  };

  const handleEnd = (table: Table, bookingId: number) => {
    const actualEndTime = getVietnamTime();
    socket?.emit('check-out', { id: bookingId, actualEndTime }, (res: any) => {
      if (res.success) {
        const totalAmount = res.data.total_amount;
        success(`Kết thúc! Bàn ${table.table_name} - Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} VNĐ`);
        setActiveBookings(prev => {
          const newMap = new Map(prev);
          newMap.delete(table.id);
          return newMap;
        });
        setTables(prev => 
          prev.map(t => t.id === table.id ? { ...t, status: 'available' } : t)
        );
        setTimeout(() => loadTables(), 500);
      } else {
        error(res.error || 'Không thể kết thúc');
      }
    });
  };

  const handlePlayDirect = (table: Table, customerName: string, customerPhone: string) => {
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
                setActiveBookings(prev => {
                  const newMap = new Map(prev);
                  newMap.set(table.id, {
                    id: bookingId,
                    start_time: startTime,
                    current_amount: 0,
                    hours_played: 0,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    food_total: 0,
                    total_amount: 0
                  });
                  return newMap;
                });
                setTables(prev => 
                  prev.map(t => t.id === table.id ? { ...t, status: 'occupied' } : t)
                );
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
  };

  const handleOrder = (table: Table, bookingId: number) => {
    setSelectedOrder({ table, bookingId });
    setIsOrderPanelOpen(true);
  };

  const handleCreateTable = (data: CreateTableData) => {
    socket?.emit('create-table', data, (res: any) => {
      if (res.success) {
        success('Thêm bàn thành công');
        setIsCreateModalOpen(false);
        loadTables();
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
        loadTables();
      } else {
        error(res.error);
      }
    });
  };

  const handleDeleteTable = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bàn này?')) return;
    socket?.emit('delete-table', { id }, (res: any) => {
      if (res.success) {
        success('Đã xóa bàn');
        loadTables();
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
        setTables(prev => 
          prev.map(t => t.id === data.table_id ? { ...t, status: 'reserved' } : t)
        );
      } else {
        error(res.error);
      }
    });
  };

  useEffect(() => {
    if (!socket || !isClient) return;

    const handleTableUpdated = (updatedTable: Table) => {
      setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
      if (updatedTable.status !== 'occupied') {
        setActiveBookings(prev => {
          const newMap = new Map(prev);
          newMap.delete(updatedTable.id);
          return newMap;
        });
      }
    };

    const handleBookingUpdated = (booking: any) => {
      if (booking.status === 'checked_in') {
        setActiveBookings(prev => {
          const newMap = new Map(prev);
          newMap.set(booking.table_id, {
            id: booking.id,
            start_time: booking.start_time,
            current_amount: 0,
            hours_played: 0,
            customer_name: booking.customer_name,
            customer_phone: booking.customer_phone,
            food_total: toNumber(booking.food_total || 0),
            total_amount: toNumber(booking.total_with_food || booking.total_amount || 0)
          });
          return newMap;
        });
      } else if (booking.status === 'completed') {
        setActiveBookings(prev => {
          const newMap = new Map(prev);
          newMap.delete(booking.table_id);
          return newMap;
        });
      } else {
        setActiveBookings(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(booking.table_id);
          if (existing) {
            newMap.set(booking.table_id, {
              ...existing,
              food_total: toNumber(booking.food_total || existing.food_total || 0),
              total_amount: toNumber(booking.total_with_food || booking.total_amount || existing.total_amount || 0)
            });
          }
          return newMap;
        });
      }
    };

    socket.on('table-updated', handleTableUpdated);
    socket.on('table-status-changed', handleTableUpdated);
    socket.on('booking-updated', handleBookingUpdated);

    return () => {
      socket.off('table-updated', handleTableUpdated);
      socket.off('table-status-changed', handleTableUpdated);
      socket.off('booking-updated', handleBookingUpdated);
    };
  }, [socket, isClient]);

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
              getActiveBooking(selectedOrder.table.id);
            }
          }}
        />
      )}
    </div>
  );
}
