'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BiCalendar,
  BiTable,
  BiFoodMenu,
  BiChevronLeft,
  BiChevronRight,
  BiHome,
  BiUser,
  BiBarChart,
  BiLogOut
} from 'react-icons/bi';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BiHome },
  { name: 'Người dùng', href: '/admin/users', icon: BiUser },
  { name: 'Bàn Bi Da', href: '/admin/tables', icon: BiTable },
  { name: 'Đặt Bàn', href: '/admin/bookings', icon: BiCalendar },
  { name: 'Sản phẩm', href: '/admin/products', icon: BiFoodMenu },
  { name: 'Thống kê', href: '/admin/reports', icon: BiBarChart }
];

interface SidebarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ onCollapsedChange }: SidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Notify parent when collapse state changes
  useEffect(() => {
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) setIsMobileOpen(!isMobileOpen);
    else setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const sidebarWidth = isMobile
    ? (isMobileOpen ? 'w-64' : 'w-0')
    : (isCollapsed ? 'w-20' : 'w-64');

  const isVisible = isMobile ? isMobileOpen : true;

  return (
    <>
      {/* Mobile Button */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-lg shadow-md md:hidden"
        >
          <BiChevronRight size={24} />
        </button>
      )}

      {/* Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 shadow-md transition-all duration-300 z-50 flex flex-col
        ${sidebarWidth} ${!isVisible && 'hidden'}`}
      >
        {/* Logo / Title */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {(!isCollapsed || isMobile) ? (
            <span className="font-semibold text-black dark:text-white text-lg">
              Billiard Manager
            </span>
          ) : null}

          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isCollapsed ? <BiChevronRight /> : <BiChevronLeft />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {navigation.map((item) => {
              const active = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition
                      ${active
                        ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
                      ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    {(!isCollapsed || isMobile) && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <ThemeToggle />

          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
            ${(isCollapsed && !isMobile) ? 'justify-center' : ''}`}
          >
            <BiLogOut className="h-5 w-5" />
            {(!isCollapsed || isMobile) && (
              <span className="text-sm font-medium">Đăng xuất</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
