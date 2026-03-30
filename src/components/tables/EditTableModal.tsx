'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { Table, UpdateTableData, TableStatus, TableType } from '@/types';
import { TABLE_STATUS, TABLE_TYPE } from '@/utils/constants';

interface EditTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateTableData) => void;
  table: Table | null;
}

export default function EditTableModal({ isOpen, onClose, onSubmit, table }: EditTableModalProps) {
  const [formData, setFormData] = useState<UpdateTableData>({
    id: 0,
    table_number: '',
    table_name: '',
    table_type: 'standard',
    price_per_hour: 0,
    description: '',
    location: '',
    status: 'available',
  });

  useEffect(() => {
    if (table) {
      setFormData({
        id: table.id,
        table_number: table.table_number,
        table_name: table.table_name,
        table_type: table.table_type,
        price_per_hour: table.price_per_hour,
        description: table.description || '',
        location: table.location || '',
        status: table.status,
      });
    }
  }, [table]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!table) return null;

  // Helper to get status color for select option
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'text-green-600 dark:text-green-400',
      occupied: 'text-red-600 dark:text-red-400',
      reserved: 'text-yellow-600 dark:text-yellow-400',
      maintenance: 'text-gray-600 dark:text-gray-400',
      cleaning: 'text-purple-600 dark:text-purple-400',
    };
    return colors[status] || '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật thông tin bàn">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
            Số bàn <span className="text-red-500 dark:text-macchiato-red">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.table_number}
            onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholder="VD: T07"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
            Tên bàn <span className="text-red-500 dark:text-macchiato-red">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.table_name}
            onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholder="VD: Bàn Standard 4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
            Loại bàn <span className="text-red-500 dark:text-macchiato-red">*</span>
          </label>
          <select
            value={formData.table_type}
            onChange={(e) => setFormData({ ...formData, table_type: e.target.value as TableType })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
          >
            {Object.entries(TABLE_TYPE).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
            Giá (VNĐ/giờ) <span className="text-red-500 dark:text-macchiato-red">*</span>
          </label>
          <input
            type="number"
            required
            value={formData.price_per_hour}
            onChange={(e) => setFormData({ ...formData, price_per_hour: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholder="50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
            Trạng thái
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TableStatus })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
          >
            {Object.entries(TABLE_STATUS).map(([value, { label }]) => (
              <option key={value} value={value} className={getStatusColor(value)}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">Vị trí</label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholder="VD: Tầng 1 - Khu A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">Mô tả</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            placeholder="Mô tả thêm về bàn..."
          />
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
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
          >
            Cập nhật
          </button>
        </div>
      </form>
    </Modal>
  );
}
