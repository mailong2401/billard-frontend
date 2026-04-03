'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { CreateBookingData, Table } from '@/types';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingData) => void;
  table: Table | null;
  defaultCustomerName?: string;
  defaultCustomerPhone?: string;
  isReadOnly?: boolean;
}

export default function BookingForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  table,
  defaultCustomerName = '',
  defaultCustomerPhone = '',
  isReadOnly = false
}: BookingFormProps) {
  const [formData, setFormData] = useState<CreateBookingData>({
    table_id: table?.id || 0,
    customer_name: defaultCustomerName,
    customer_phone: defaultCustomerPhone,
    start_time: '',
    end_time: '',
    notes: '',
  });

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Cập nhật formData khi defaultCustomerName thay đổi
  useEffect(() => {
    if (defaultCustomerName) {
      setFormData(prev => ({ ...prev, customer_name: defaultCustomerName }));
    }
  }, [defaultCustomerName]);

  useEffect(() => {
    if (defaultCustomerPhone) {
      setFormData(prev => ({ ...prev, customer_phone: defaultCustomerPhone }));
    }
  }, [defaultCustomerPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      onSubmit({
        ...formData,
        table_id: table!.id,
        start_time: startDate.toISOString().slice(0, 19).replace('T', ' '),
        end_time: endDate.toISOString().slice(0, 19).replace('T', ' '),
      });
      onClose();
      setFormData({
        table_id: 0,
        customer_name: defaultCustomerName,
        customer_phone: defaultCustomerPhone,
        start_time: '',
        end_time: '',
        notes: '',
      });
      setStartDate(null);
      setEndDate(null);
    }
  };

  if (!table) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Đặt bàn - ${table.table_name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tên khách hàng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            readOnly={isReadOnly}
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white ${
              isReadOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
            }`}
            placeholder="Nhập tên khách hàng"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            readOnly={isReadOnly}
            value={formData.customer_phone}
            onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white ${
              isReadOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
            }`}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thời gian bắt đầu <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="dd/MM/yyyy HH:mm"
            minDate={new Date()}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            placeholderText="Chọn ngày và giờ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thời gian kết thúc <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            dateFormat="dd/MM/yyyy HH:mm"
            minDate={startDate || new Date()}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            placeholderText="Chọn ngày và giờ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            placeholder="Ghi chú thêm..."
          />
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            💰 Giá: <span className="font-semibold text-black dark:text-white">{new Intl.NumberFormat('vi-VN').format(table.price_per_hour)} VNĐ</span>/giờ
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ⏱️ Thời gian sẽ được tính từ lúc bắt đầu (tính theo giờ, làm tròn lên)
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-all hover:scale-[1.02] active:scale-95"
          >
            Xác nhận đặt bàn
          </button>
        </div>
      </form>
    </Modal>
  );
}
