'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { Table } from '@/types';
import { BiPlay, BiCoffee, BiSearch, BiCalendar } from 'react-icons/bi';
import OrderPanel from '@/components/admin/tables/OrderPanel';
import PlayDirectModal from '@/components/admin/tables/PlayDirectModal';
import BookingForm from '@/components/admin/bookings/BookingForm';

// Helper functions (giữ nguyên)
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

const formatDuration = (hours: number): string => {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
};

const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

interface TableWithBooking extends Table {
  booking_id?: number;
  booking_start_time?: string;
  booking_customer_name?: string;
  booking_customer_phone?: string;
  booking_food_total?: number;
}

export default function StaffPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();
  const { user } = useAuth();

  const [tables, setTables] = useState<TableWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedTable, setSelectedTable] = useState<TableWithBooking | null>(null);
  const [showPlayDirectModal, setShowPlayDirectModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  
  const isMounted = useRef(true);
  const initialized = useRef(false);
  const realtimeInterval = useRef<NodeJS.Timeout | null>(null);
  const [activeBookings, setActiveBookings] = useState<Map<number, { 
    id: number; 
    start_time: string; 
    current_amount: number; 
    hours_played: number;
    customer_name?: string;
    customer_phone?: string;
    food_total?: number;
    total_amount?: number;
  }>>(new Map());

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ================= LOAD TABLES =================
  const loadTables = useCallback(() => {
    socket?.emit('get-tables-full', {}, (res: any) => {
      if (!isMounted.current) return;
      if (res.success) {
        setTables(res.data);
        const bookingsMap = new Map();
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
              food_total: safeNumber(table.food_total || 0),
              total_amount: currentAmount + safeNumber(table.food_total || 0),
            });
          }
        });
        setActiveBookings(bookingsMap);
      }
      setLoading(false);
    });
  }, [socket]);

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
    if (realtimeInterval.current) clearInterval(realtimeInterval.current);
    realtimeInterval.current = setInterval(() => {
      setActiveBookings(prev => {
        const newMap = new Map(prev);
        newMap.forEach((booking, tableId) => {
          if (!booking?.start_time) return;
          const table = tables.find(t => t.id === tableId);
          if (!table) return;
          const startTime = parseDateTime(booking.start_time);
          const now = new Date();
          const diffMs = now.getTime() - startTime.getTime();
          const hoursPlayed = Math.max(0, diffMs / (1000 * 60 * 60));
          const currentAmount = Math.ceil(hoursPlayed) * table.price_per_hour;
          newMap.set(tableId, {
            ...booking,
            current_amount: currentAmount,
            hours_played: hoursPlayed,
            total_amount: currentAmount + safeNumber(booking.food_total || 0),
          });
        });
        return newMap;
      });
    }, 1000);
    return () => {
      if (realtimeInterval.current) clearInterval(realtimeInterval.current);
    };
  }, [socket, isClient, tables]);

  // ================= REALTIME TABLE UPDATES =================
  useEffect(() => {
    if (!socket || !isClient) return;
    const handleTableCreated = (newTable: any) => {
      setTables(prev => [newTable, ...prev]);
      success(`Bàn mới "${newTable.table_name}" đã được thêm`);
    };
    const handleTableUpdated = (updatedTable: any) => {
      setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
      success(`Bàn "${updatedTable.table_name}" đã được cập nhật`);
    };
    const handleTableDeleted = ({ tableId }: { tableId: number }) => {
      setTables(prev => prev.filter(t => t.id !== tableId));
      success(`Bàn đã được xóa`);
    };
    const handleTableStatusChanged = (updatedTable: any) => {
      setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    };
    socket.on('table-created', handleTableCreated);
    socket.on('table-updated', handleTableUpdated);
    socket.on('table-deleted', handleTableDeleted);
    socket.on('table-status-changed', handleTableStatusChanged);
    return () => {
      socket.off('table-created', handleTableCreated);
      socket.off('table-updated', handleTableUpdated);
      socket.off('table-deleted', handleTableDeleted);
      socket.off('table-status-changed', handleTableStatusChanged);
    };
  }, [socket, isClient, success]);

  // ================= ACTIONS =================
  const handlePlayDirectSubmit = (customerName: string, customerPhone: string) => {
    if (!selectedTable) return;
    const startTime = getVietnamTime();
    const startDate = parseDateTime(startTime);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const endTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
    const bookingData = {
      table_id: selectedTable.id,
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
                success(`Bắt đầu chơi! Bàn ${selectedTable.table_name} - Khách: ${customerName}`);
                setTimeout(() => loadTables(), 500);
                setShowPlayDirectModal(false);
                setSelectedTable(null);
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

  const handleBookTable = (data: any) => {
    socket?.emit('create-booking', data, (res: any) => {
      if (res.success) {
        success(`Đặt bàn thành công! Bàn ${selectedTable?.table_name}`);
        setTimeout(() => loadTables(), 500);
        setShowBookingModal(false);
        setSelectedTable(null);
      } else {
        error(res.error || 'Không thể đặt bàn');
      }
    });
  };

  const handleOrder = (table: TableWithBooking, bookingId: number) => {
    setSelectedBookingId(bookingId);
    setSelectedTable(table);
    setIsOrderPanelOpen(true);
  };

  const filteredTables = tables.filter(table => 
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.table_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient || !isConnected || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-black dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng bàn</p>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.available}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Trống</p>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.occupied}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đang chơi</p>
          </div>
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.reserved}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đã đặt</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            />
          </div>
        </div>

        {/* Tables Grid */}
        {filteredTables.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Không tìm thấy bàn nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map((table) => {
              const activeBooking = activeBookings.get(table.id);
              const isOccupied = table.status === 'occupied';
              const isAvailable = table.status === 'available';
              const isReserved = table.status === 'reserved';
              
              return (
                <div key={table.id} className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-800">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-black dark:text-white">{table.table_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{table.table_number}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isAvailable ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        isOccupied ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {isAvailable ? 'Trống' : isOccupied ? 'Đang chơi' : 'Đã đặt'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Giá:</span>
                        <span className="font-medium text-black dark:text-white">
                          {formatCurrency(table.price_per_hour)} / giờ
                        </span>
                      </div>
                      {isOccupied && activeBooking && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Thời gian đã chơi:</span>
                            <span className="font-medium text-black dark:text-white">
                              {formatDuration(safeNumber(activeBooking.hours_played))}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Tiền bàn:</span>
                            <span className="font-medium text-black dark:text-white">
                              {formatCurrency(safeNumber(activeBooking.current_amount))}
                            </span>
                          </div>
                          {safeNumber(activeBooking.food_total) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Tiền đồ ăn:</span>
                              <span className="font-medium text-black dark:text-white">
                                {formatCurrency(safeNumber(activeBooking.food_total))}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-semibold text-black dark:text-white">Tổng cộng:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(safeNumber(activeBooking.total_amount))}
                            </span>
                          </div>
                        </>
                      )}
                      {isReserved && activeBooking && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Khách hàng:</span>
                            <span className="font-medium text-black dark:text-white">
                              {activeBooking.customer_name || 'Chưa có'} - {activeBooking.customer_phone || 'Chưa có'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Thời gian đặt:</span>
                            <span className="font-medium text-black dark:text-white">
                              {activeBooking.start_time ? new Date(activeBooking.start_time).toLocaleString('vi-VN') : 'Chưa có'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {isAvailable && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedTable(table);
                              setShowPlayDirectModal(true);
                            }}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-95"
                          >
                            <BiPlay className="h-4 w-4" />
                            <span>Play ngay</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTable(table);
                              setShowBookingModal(true);
                            }}
                            className="px-3 py-2 rounded-md text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Đặt bàn"
                          >
                            <BiCalendar className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {isOccupied && activeBooking && (
                        <button
                          onClick={() => handleOrder(table, activeBooking.id)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <BiCoffee className="h-4 w-4" />
                          <span>Gọi đồ</span>
                        </button>
                      )}

                      {isReserved && activeBooking && (
                        <button
                          onClick={() => {
                            socket?.emit('check-in', { id: activeBooking.id }, (checkInRes: any) => {
                              if (checkInRes.success) {
                                success(`Bắt đầu chơi! Bàn ${table.table_name}`);
                                setTimeout(() => loadTables(), 500);
                              } else {
                                error(checkInRes.error || 'Không thể bắt đầu chơi');
                              }
                            });
                          }}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <BiPlay className="h-4 w-4" />
                          <span>Bắt đầu</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Play Direct Modal */}
      {showPlayDirectModal && selectedTable && (
        <PlayDirectModal
          isOpen={showPlayDirectModal}
          onClose={() => {
            setShowPlayDirectModal(false);
            setSelectedTable(null);
          }}
          table={selectedTable}
          onSubmit={handlePlayDirectSubmit}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedTable && (
        <BookingForm
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedTable(null);
          }}
          onSubmit={handleBookTable}
          table={selectedTable}
        />
      )}

      {/* Order Panel */}
      {isOrderPanelOpen && selectedBookingId && selectedTable && (
        <OrderPanel
          isOpen={isOrderPanelOpen}
          onClose={() => {
            setIsOrderPanelOpen(false);
            setSelectedBookingId(null);
            setSelectedTable(null);
          }}
          tableId={selectedTable.id}
          bookingId={selectedBookingId}
          tableName={selectedTable.table_name}
          socket={socket}
          onOrderUpdate={() => {
            setTimeout(() => loadTables(), 500);
          }}
        />
      )}
    </div>
  );
}
