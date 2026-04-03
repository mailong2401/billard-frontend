"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import { Table, UpdateTableData, TableStatus, TableType } from "@/types";
import { TABLE_STATUS, TABLE_TYPE } from "@/utils/constants";

interface EditTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateTableData) => void;
  table: Table | null;
}

export default function EditTableModal({
  isOpen,
  onClose,
  onSubmit,
  table,
}: EditTableModalProps) {
  const [formData, setFormData] = useState<UpdateTableData>({
    id: 0,
    table_number: "",
    table_name: "",
    table_type: "standard",
    price_per_hour: 0,
    description: "",
    location: "",
    status: "available",
  });

  useEffect(() => {
    if (table) {
      // Làm sạch giá trị price_per_hour (loại bỏ số thập phân nếu có)
      const cleanPrice = table.price_per_hour
        ? Math.floor(Number(table.price_per_hour))
        : 0;

      setFormData({
        id: table.id,
        table_number: table.table_number,
        table_name: table.table_name,
        table_type: table.table_type,
        price_per_hour: cleanPrice,
        description: table.description || "",
        location: table.location || "",
        status: table.status,
      });
    }
  }, [table]);

  // Format giá tiền
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // Xử lý thay đổi giá
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Loại bỏ tất cả ký tự không phải số
    value = value.replace(/[^0-9]/g, "");

    if (value === "") {
      setFormData({ ...formData, price_per_hour: 0 });
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        setFormData({ ...formData, price_per_hour: numValue });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!table) return null;

  // Helper to get status color for select option
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "text-emerald-600 dark:text-emerald-400",
      occupied: "text-red-600 dark:text-red-400",
      reserved: "text-amber-600 dark:text-amber-400",
      maintenance: "text-gray-600 dark:text-gray-400",
      cleaning: "text-purple-600 dark:text-purple-400",
    };
    return colors[status] || "";
  };

  // Lấy giá trị price an toàn
  const safePrice = formData.price_per_hour || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật thông tin bàn">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Số bàn <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.table_number}
            onChange={(e) =>
              setFormData({ ...formData, table_number: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            placeholder="VD: T07"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tên bàn <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.table_name}
            onChange={(e) =>
              setFormData({ ...formData, table_name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            placeholder="VD: Bàn Standard 4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Loại bàn <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.table_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                table_type: e.target.value as TableType,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
          >
            {Object.entries(TABLE_TYPE).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Giá (VNĐ/giờ) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              required
              value={safePrice === 0 ? "" : formatPrice(safePrice)}
              onChange={handlePriceChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white pr-16"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
              VNĐ/giờ
            </span>
          </div>
          {safePrice > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {formatPrice(safePrice)} VNĐ/giờ
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trạng thái
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as TableStatus,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
          >
            {Object.entries(TABLE_STATUS).map(([value, { label }]) => (
              <option
                key={value}
                value={value}
                className={getStatusColor(value)}
              >
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vị trí
          </label>
          <input
            type="text"
            value={formData.location || ""}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            placeholder="VD: Tầng 1 - Khu A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mô tả
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            placeholder="Mô tả thêm về bàn..."
          />
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
            Cập nhật
          </button>
        </div>
      </form>
    </Modal>
  );
}
