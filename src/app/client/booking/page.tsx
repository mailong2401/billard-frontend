'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { BiCalendar, BiPhone, BiTime, BiUser } from 'react-icons/bi';

export default function BookingPage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    socket?.emit('create-booking', formData, (res: any) => {
      if (res.success) {
        success('Đặt bàn thành công!');
        router.push('/client/tables');
      } else {
        error(res.error || 'Đặt bàn thất bại');
      }
      setLoading(false);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Đang kết nối...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Nút quay lại */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mb-4 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
      >
        <span className="text-lg">←</span>
        <span>Quay lại</span>
      </button>

      <div className="bg-white dark:bg-black rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Đặt bàn
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Vui lòng điền thông tin để đặt bàn
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-black text-slate-900 dark:text-white"
                placeholder="Nhập họ tên"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
              <input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-black text-slate-900 dark:text-white"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          {/* Thời gian bắt đầu */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BiTime className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-black text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Thời gian kết thúc */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Thời gian kết thúc <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BiTime className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-black text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-black text-slate-900 dark:text-white"
              placeholder="Nhập ghi chú (nếu có)..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đặt bàn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
