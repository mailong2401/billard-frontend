'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import Header from '@/components/client/Header';
import { formatCurrency } from '@/utils/formatters';
import { BiUser, BiPhone, BiCalendar, BiTime, BiArrowLeft } from 'react-icons/bi';

export default function ClientBooking() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();
  
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    start_time: '',
    duration_hours: 1,
    notes: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadTables = useCallback(() => {
    socket?.emit('get-tables', { status: 'available' }, (res: any) => {
      if (res.success) {
        setTables(res.data);
        const tableId = searchParams.get('tableId');
        if (tableId) {
          const table = res.data.find((t: any) => t.id === parseInt(tableId));
          setSelectedTable(table || null);
        }
      }
      setLoading(false);
    });
  }, [socket, searchParams]);

  useEffect(() => {
    if (isClient && socket && isConnected) {
      loadTables();
    }
  }, [isClient, socket, isConnected, loadTables]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTable) {
      error('Vui lòng chọn bàn');
      return;
    }

    const startTime = new Date(formData.start_time);
    const endTime = new Date(startTime.getTime() + formData.duration_hours * 60 * 60 * 1000);
    
    const bookingData = {
      table_id: selectedTable.id,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      start_time: startTime.toISOString().slice(0, 19).replace('T', ' '),
      end_time: endTime.toISOString().slice(0, 19).replace('T', ' '),
      duration_hours: formData.duration_hours,
      total_amount: selectedTable.price_per_hour * formData.duration_hours,
      notes: formData.notes
    };

    socket?.emit('create-booking', bookingData, (res: any) => {
      if (res.success) {
        success('Đặt bàn thành công! Vui lòng đến đúng giờ.');
        router.push('/client/profile');
      } else {
        error(res.error || 'Đặt bàn thất bại');
      }
    });
  };

  if (!isClient || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  // Set min datetime to now
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 30 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 dark:text-macchiato-subtext mb-4 hover:text-primary-600"
        >
          <BiArrowLeft className="h-5 w-5" />
          <span>Quay lại</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-macchiato-text mb-2">
          Đặt bàn
        </h1>
        <p className="text-gray-600 dark:text-macchiato-subtext mb-6">
          Vui lòng điền thông tin để đặt bàn
        </p>

        <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6">
          {/* Table Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-2">
              Chọn bàn
            </label>
            <select
              value={selectedTable?.id || ''}
              onChange={(e) => {
                const table = tables.find(t => t.id === parseInt(e.target.value));
                setSelectedTable(table);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md bg-white dark:bg-macchiato-base"
              required
            >
              <option value="">-- Chọn bàn --</option>
              {tables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.table_name} - {formatCurrency(table.price_per_hour)}/giờ
                </option>
              ))}
            </select>
          </div>

          {selectedTable && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
                  <BiUser className="inline mr-1" /> Tên khách hàng
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
                  <BiPhone className="inline mr-1" /> Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
                  <BiCalendar className="inline mr-1" /> Thời gian bắt đầu
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  min={minDateTime}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
                  <BiTime className="inline mr-1" /> Số giờ chơi
                </label>
                <select
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md"
                >
                  {[1, 2, 3, 4, 5, 6].map(h => (
                    <option key={h} value={h}>{h} giờ</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
 rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md"
                  placeholder="Yêu cầu đặc biệt (nếu có)..."
                />
              </div>

              <div className="bg-gray-50 dark:bg-macchiato-mantle rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span>Giá bàn:</span>
                  <span>{formatCurrency(selectedTable.price_per_hour)}/giờ</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Số giờ:</span>
                  <span>{formData.duration_hours} giờ</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Tổng tiền:</span>
                  <span className="text-primary-600">
                    {formatCurrency(selectedTable.price_per_hour * formData.duration_hours)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
              >
                Xác nhận đặt bàn
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
