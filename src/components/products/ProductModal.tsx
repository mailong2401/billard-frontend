'use client';

import { useState, useEffect } from 'react';
import { BiX } from 'react-icons/bi';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  categories: any[];
  product?: any;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  product
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    is_available: 1,
    stock: 0
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category_id: product.category_id?.toString() || '',
        is_available: product.is_available !== undefined ? product.is_available : 1,
        stock: product.stock || 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category_id: '',
        is_available: 1,
        stock: 0
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      category_id: Number(formData.category_id),
      stock: Number(formData.stock)
    });
  };

  // Format price display
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-macchiato-base rounded-lg shadow-xl max-w-md w-full transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-macchiato-surface">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-macchiato-text">
            {product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:text-macchiato-subtext dark:hover:text-macchiato-text transition-all hover:scale-110"
          >
            <BiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Tên sản phẩm <span className="text-red-500 dark:text-macchiato-red">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text transition-colors"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Danh mục <span className="text-red-500 dark:text-macchiato-red">*</span>
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text transition-colors cursor-pointer"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Giá (VNĐ) <span className="text-red-500 dark:text-macchiato-red">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text transition-colors pr-16"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-macchiato-subtext">
                VNĐ
              </span>
            </div>
            {formData.price > 0 && (
              <p className="text-xs text-green-600 dark:text-macchiato-green mt-1">
                {formatPrice(formData.price)} VNĐ
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Số lượng tồn kho
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text transition-colors"
              placeholder="0"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text transition-colors resize-none"
              placeholder="Mô tả sản phẩm..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-macchiato-subtext mb-1">
              Trạng thái
            </label>
            <select
              value={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text transition-colors cursor-pointer"
            >
              <option value={1}>✅ Đang bán</option>
              <option value={0}>❌ Ngừng bán</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-macchiato-surface rounded-md text-gray-700 dark:text-macchiato-subtext hover:bg-gray-50 dark:hover:bg-macchiato-surface transition-all hover:scale-[1.02] active:scale-95"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
            >
              {product ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
