'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import { CreateTableData, TableType } from '@/types';
import { TABLE_TYPE } from '@/utils/constants';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTableData) => void;
}

export default function CreateTableModal({ isOpen, onClose, onSubmit }: CreateTableModalProps) {
  const [formData, setFormData] = useState<CreateTableData>({
    table_number: '',
    table_name: '',
    table_type: 'standard',
    price_per_hour: 50000,
    description: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      table_number: '',
      table_name: '',
      table_type: 'standard',
      price_per_hour: 50000,
      description: '',
      location: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm bàn mới">
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
            Thêm bàn
          </button>
        </div>
      </form>
    </Modal>
  );
}
