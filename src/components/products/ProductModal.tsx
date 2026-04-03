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
    is_available: true,
    stock: 0
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category_id: product.category_id?.toString() || '',
        is_available: product.is_available !== undefined ? product.is_available : true,
        stock: product.stock || 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category_id: '',
        is_available: true,
        stock: 0
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price) || 0,
      category_id: Number(formData.category_id),
      stock: Number(formData.stock) || 0,
      is_available: formData.is_available
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Xử lý thay đổi giá
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setFormData({ ...formData, price: 0 });
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setFormData({ ...formData, price: numValue });
      }
    }
  };

  // Xử lý thay đổi stock
  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setFormData({ ...formData, stock: 0 });
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setFormData({ ...formData, stock: numValue });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all hover:scale-110"
          >
            <BiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-colors"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-colors cursor-pointer"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Giá (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={formData.price === 0 ? '' : formData.price}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-colors pr-16"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                VNĐ
              </span>
            </div>
            {formData.price > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {formatPrice(formData.price)} VNĐ
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Số lượng tồn kho
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.stock === 0 ? '' : formData.stock}
              onChange={handleStockChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-colors"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-colors resize-none"
              placeholder="Mô tả sản phẩm..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái
            </label>
            <select
              value={formData.is_available ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-colors cursor-pointer"
            >
              <option value="true">Đang bán</option>
              <option value="false">Ngừng bán</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
            >
              {product ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
