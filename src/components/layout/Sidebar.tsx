'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BiBasketball, 
  BiCalendar, 
  BiTable, 
  BiFoodMenu, 
  BiChevronLeft, 
  BiChevronRight,
  BiHome,
  BiCog
} from 'react-icons/bi';
import ThemeToggle from './ThemeToggle';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BiHome },
  { name: 'Bàn Bi Da', href: '/admin/tables', icon: BiTable },
  { name: 'Đặt Bàn', href: '/admin/bookings', icon: BiCalendar },
  { name: 'Sản phẩm', href: '/admin/products', icon: BiFoodMenu },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const sidebarWidth = isMobile ? (isMobileOpen ? 'w-64' : 'w-0') : (isCollapsed ? 'w-20' : 'w-64');
  const isVisible = isMobile ? isMobileOpen : true;

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors md:hidden"
        >
          <BiChevronRight size={24} />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
          onClick={toggleSidebar}
        />
      )}
      
      <aside 
        className={`fixed left-0 top-0 h-full bg-white dark:bg-macchiato-base shadow-xl transition-all duration-300 z-50 flex flex-col
          ${sidebarWidth} ${!isVisible && 'hidden'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-macchiato-surface">
          {(!isCollapsed || isMobile) && (
            <Link href="/" className="flex items-center space-x-2" onClick={handleLinkClick}>
              <BiBasketball className="h-8 w-8 text-primary-600 dark:text-macchiato-blue" />
              <span className="text-lg font-bold text-gray-900 dark:text-macchiato-text">
                Billiard Manager
              </span>
            </Link>
          )}
          {(isCollapsed && !isMobile) && (
            <Link href="/" className="flex justify-center w-full" onClick={handleLinkClick}>
              <BiBasketball className="h-8 w-8 text-primary-600 dark:text-macchiato-blue" />
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-macchiato-surface transition-colors text-gray-600 dark:text-macchiato-subtext"
            title={isCollapsed ? "Mở rộng" : "Thu nhỏ"}
          >
            {isCollapsed ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group
                      ${isActive 
                        ? 'bg-primary-50 dark:bg-macchiato-surface text-primary-700 dark:text-macchiato-text' 
                        : 'text-gray-700 dark:text-macchiato-subtext hover:bg-gray-100 dark:hover:bg-macchiato-surface hover:text-gray-900 dark:hover:text-macchiato-text'
                      }
                      ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
                    `}
                    title={(isCollapsed && !isMobile) ? item.name : ''}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive 
                        ? 'text-primary-600 dark:text-macchiato-blue' 
                        : 'text-gray-500 dark:text-macchiato-subtext group-hover:text-gray-700 dark:group-hover:text-macchiato-text'
                    }`} />
                    {((!isCollapsed && !isMobile) || isMobile) && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-macchiato-surface space-y-2">
          <ThemeToggle />
          <Link
            href="/settings"
            onClick={handleLinkClick}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-700 dark:text-macchiato-subtext hover:bg-gray-100 dark:hover:bg-macchiato-surface hover:text-gray-900 dark:hover:text-macchiato-text
              ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
            `}
            title={(isCollapsed && !isMobile) ? "Cài đặt" : ""}
          >
            <BiCog className="h-5 w-5" />
            {((!isCollapsed && !isMobile) || isMobile) && (
              <span className="text-sm font-medium">Cài đặt</span>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
