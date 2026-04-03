'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BiLogOut, BiFoodMenu, BiUser, BiTable } from 'react-icons/bi';
import { FiUsers } from "react-icons/fi";
import ThemeToggle from '@/components/layout/ThemeToggle';
import Link from 'next/link';
import { useState } from 'react';

export default function StaffHeader() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/staff" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-black dark:text-white">Billiard Staff</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Link đến menu */}
            <Link
              href="/staff"
              className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <BiTable className="h-5 w-5" />
              <span className="hidden sm:inline">Bàn bida</span>
            </Link>

            <Link
              href="/staff/menu"
              className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <BiFoodMenu className="h-5 w-5" />
              <span className="hidden sm:inline">Thực đơn</span>
            </Link>

            {/* Link đến khách hàng */}
            <Link
              href="/staff/customers"
              className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiUsers className="h-5 w-5" />
              <span className="hidden sm:inline">Khách hàng</span>
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <BiUser className="h-5 w-5" />
                <span className="hidden sm:inline">{user?.full_name || user?.username}</span>
              </button>
              
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <Link
                      href="/staff/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <BiUser className="h-4 w-4" />
                      Hồ sơ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left rounded-b-lg transition-colors"
                    >
                      <BiLogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
