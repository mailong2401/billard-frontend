'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BiTable, BiCalendar, BiCoffee, BiUser, BiPlay } from 'react-icons/bi';
import { useSocket } from '@/hooks/useSocket';
import Header from '@/components/client/Header';
import TableCardClient from '@/components/client/TableCardClient';
import { formatCurrency } from '@/utils/formatters';

interface Table {
  id: number;
  table_number: string;
  table_name: string;
  table_type: string;
  price_per_hour: number;
  status: string;
  location?: string;
}

export default function ClientHome() {
  const { socket, isConnected } = useSocket();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadTables = useCallback(() => {
    socket?.emit('get-tables', { status: 'available' }, (res: any) => {
      if (res.success) {
        setTables(res.data);
      }
      setLoading(false);
    });
  }, [socket]);

  useEffect(() => {
    if (isClient && socket && isConnected) {
      loadTables();
    }
  }, [isClient, socket, isConnected, loadTables]);

  if (!isClient || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-macchiato-subtext">Đang kết nối...</p>
          </div>
        </div>
      </div>
    );
  }

  const availableTables = tables.filter(t => t.status === 'available').length;
  const vipTables = tables.filter(t => t.table_type === 'vip').length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Chào mừng đến với Billiard Club</h1>
          <p className="text-primary-100 mb-4">Trải nghiệm không gian bi da đẳng cấp</p>
          <div className="flex gap-4">
            <Link
              href="/client/tables"
              className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Xem bàn trống
            </Link>
            <Link
              href="/client/booking"
              className="bg-transparent border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
            >
              Đặt bàn ngay
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-macchiato-subtext">Bàn trống</p>
                <p className="text-3xl font-bold text-green-600">{availableTables}</p>
              </div>
              <BiTable className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-macchiato-subtext">Bàn VIP</p>
                <p className="text-3xl font-bold text-purple-600">{vipTables}</p>
              </div>
              <BiTable className="h-12 w-12 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-macchiato-subtext">Giá từ</p>
                <p className="text-2xl font-bold text-blue-600">50,000₫/h</p>
              </div>
              <BiPlay className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Featured Tables */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-macchiato-text mb-4">
            Bàn trống gần đây
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.slice(0, 3).map((table) => (
              <TableCardClient key={table.id} table={table} />
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            href="/client/menu"
            className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <BiCoffee className="h-12 w-12 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text">Menu</h3>
            <p className="text-gray-500 dark:text-macchiato-subtext text-sm">Đồ ăn & thức uống</p>
          </Link>
          
          <Link
            href="/client/booking"
            className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <BiCalendar className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text">Đặt bàn</h3>
            <p className="text-gray-500 dark:text-macchiato-subtext text-sm">Đặt trước bàn ưa thích</p>
          </Link>
          
          <Link
            href="/client/profile"
            className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <BiUser className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text">Hồ sơ</h3>
            <p className="text-gray-500 dark:text-macchiato-subtext text-sm">Lịch sử đặt bàn</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
