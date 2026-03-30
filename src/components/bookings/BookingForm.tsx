'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import { CreateBookingData, Table } from '@/types';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingData) => void;
  table: Table | null;
}

export default function BookingForm({ isOpen, onClose, onSubmit, table }: BookingFormProps) {
  const [formData, setFormData] = useState<CreateBookingData>({
    table_id: table?.id || 0,
    customer_name: '',
    customer_phone: '',
    start_time: '',
    end_time: '',
    notes: '',
  });

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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
        customer_name: '',
        customer_phone: '',
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
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
            Tên khách hàng <span className="text-red-500 dark:text-macchiato-red">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholder="Nhập tên khách hàng"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
            Số điện thoại <span className="text-red-500 dark:text-macchiato-red">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.customer_phone}
            onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
            Thời gian bắt đầu <span className="text-red-500 dark:text-macchiato-red">*</span>
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="dd/MM/yyyy HH:mm"
            minDate={new Date()}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholderText="Chọn ngày và giờ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
            Thời gian kết thúc <span className="text-red-500 dark:text-macchiato-red">*</span>
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            dateFormat="dd/MM/yyyy HH:mm"
            minDate={startDate || new Date()}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholderText="Chọn ngày và giờ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">Ghi chú</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholder="Ghi chú thêm..."
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
          <p className="text-sm text-blue-800 dark:text-macchiato-blue">
            Giá: {new Intl.NumberFormat('vi-VN').format(table.price_per_hour)} VNĐ/giờ
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md text-gray-700 dark:text-macchiato-subtext hover:bg-gray-50 dark:hover:bg-macchiato-surface transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Xác nhận đặt bàn
          </button>
        </div>
      </form>
    </Modal>
  );
}
