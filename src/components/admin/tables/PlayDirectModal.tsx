"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { Table } from "@/types";

interface PlayDirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
  onSubmit: (customerName: string, customerPhone: string) => void;
}

export default function PlayDirectModal({
  isOpen,
  onClose,
  table,
  onSubmit,
}: PlayDirectModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const handleSubmit = () => {
    if (customerName && customerPhone) {
      onSubmit(customerName, customerPhone);
      setCustomerName("");
      setCustomerPhone("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            🎱 Play ngay - {table.table_name}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên khách hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                placeholder="Nhập tên khách hàng"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💰 Giá:{" "}
                <span className="font-semibold text-black dark:text-white">
                  {formatCurrency(table.price_per_hour)} VNĐ
                </span>
                /giờ
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ⏱️ Thời gian sẽ được tính từ lúc bắt đầu (tính theo giờ, làm
                tròn lên)
              </p>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!customerName || !customerPhone}
                className={`flex-1 px-4 py-2 rounded-md text-white transition-all hover:scale-[1.02] active:scale-95 ${
                  customerName && customerPhone
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Bắt đầu chơi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
