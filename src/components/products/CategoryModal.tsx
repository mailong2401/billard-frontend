'use client';

import { useState, useEffect } from 'react';
import { BiX } from 'react-icons/bi';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  category?: any;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: 0,
    is_active: 1
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        sort_order: category.sort_order || 0,
        is_active: category.is_active !== undefined ? category.is_active : 1
      });
    } else {
      setFormData({
        name: '',
        description: '',
        sort_order: 0,
        is_active: 1
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-macchiato-base rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-macchiato-surface">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-macchiato-text">
            {category ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:text-macchiato-subtext dark:hover:text-macchiato-text transition-colors"
          >
            <BiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Tên danh mục <span className="text-red-500 dark:text-macchiato-red">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
              placeholder="Nhập tên danh mục"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Mô tả
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
              placeholder="Mô tả danh mục..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Thứ tự sắp xếp
            </label>
            <input
              type="number"
              min="0"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            />
            <p className="text-xs text-gray-500 dark:text-macchiato-subtext mt-1">
              Số càng nhỏ càng hiển thị lên đầu
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Trạng thái
            </label>
            <select
              value={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text"
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </select>
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
              {category ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
