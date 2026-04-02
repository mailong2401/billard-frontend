'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BiHome, 
  BiTable, 
  BiCalendar, 
  BiCoffee, 
  BiUser,
  BiMenu,
  BiX,
  BiWifi,
  BiWifiOff
} from 'react-icons/bi';
import { useSocket } from '@/hooks/useSocket';

export default function Header() {
  const pathname = usePathname();
  const { isConnected } = useSocket();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const name = localStorage.getItem('customer_name');
    if (name) setCustomerName(name);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/client', label: 'Trang chủ', icon: BiHome },
    { href: '/client/tables', label: 'Bàn', icon: BiTable },
    { href: '/client/booking', label: 'Đặt bàn', icon: BiCalendar },
    { href: '/client/menu', label: 'Menu', icon: BiCoffee },
    { href: '/client/profile', label: 'Hồ sơ', icon: BiUser },
  ];

  const isActive = (path: string) => {
    if (!isMounted) return false;
    if (path === '/client' && pathname === '/client') return true;
    if (path !== '/client' && pathname?.startsWith(path)) return true;
    return false;
  };

  // Tránh lỗi hydration
  if (!isMounted) {
    return (
      <header className="bg-white/80 dark:bg-macchiato-surface/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl"></div>
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/80 dark:bg-macchiato-surface/80 backdrop-blur-xl shadow-lg' 
            : 'bg-white/60 dark:bg-macchiato-surface/60 backdrop-blur-md'
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
        
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <Link 
              href="/client" 
              className="group flex items-center space-x-2 hover:opacity-90 transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <span className="text-white text-xl transform group-hover:scale-110 transition-transform duration-300">🎱</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Billiard Club
                </span>
                <p className="text-xs text-gray-500 dark:text-macchiato-subtext hidden sm:block">
                  Đẳng cấp & Chuyên nghiệp
                </p>
              </div>
            </Link>

            {/* Navigation - Center */}
            <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      active
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-macchiato-subtext hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                      active ? 'text-primary-600' : ''
                    }`} />
                    <span className="font-medium">{item.label}</span>
                    
                    {active && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary-600 rounded-full"></span>
                    )}
                    
                    <span className="absolute inset-0 rounded-lg bg-primary-50/50 dark:bg-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 backdrop-blur-sm"></span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-white/50 dark:bg-macchiato-mantle/50 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                {isConnected ? (
                  <>
                    <BiWifi className="h-3 w-3 text-green-500 animate-pulse" />
                    <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                  </>
                ) : (
                  <>
                    <BiWifiOff className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">Offline</span>
                  </>
                )}
              </div>

              {/* Customer Info */}
              {customerName && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-primary-50/80 to-primary-100/80 dark:from-primary-900/30 dark:to-primary-900/40 backdrop-blur-sm rounded-full border border-primary-200/50 dark:border-primary-800/50">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <BiUser className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {customerName}
                  </span>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/50 dark:bg-macchiato-mantle/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-macchiato-mantle/80 transition-all duration-300 hover:scale-110"
              >
                {isMobileMenuOpen ? (
                  <BiX className="h-6 w-6" />
                ) : (
                  <BiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer để tránh nội dung bị header che */}
      <div className="h-[73px]"></div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-[73px] z-40 transition-all duration-500 ease-in-out ${
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100 visible'
            : '-translate-y-full opacity-0 invisible'
        }`}
      >
        <div className="bg-white/95 dark:bg-macchiato-surface/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="container mx-auto px-4 py-4">
            {/* Customer Info Mobile */}
            {customerName && (
              <div className="flex items-center justify-between p-4 mb-4 bg-gradient-to-r from-primary-50/80 to-primary-100/80 dark:from-primary-900/30 dark:to-primary-900/40 backdrop-blur-sm rounded-xl border border-primary-200/50 dark:border-primary-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <BiUser className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-macchiato-text">{customerName}</p>
                    <p className="text-xs text-gray-500">Khách hàng thân thiết</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <BiWifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <BiWifiOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="space-y-2">
              {navItems.map((item, index) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:translate-x-2 ${
                      active
                        ? 'bg-primary-50/80 dark:bg-primary-900/30 backdrop-blur-sm text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-macchiato-text hover:bg-gray-100/80 dark:hover:bg-macchiato-mantle/80 backdrop-blur-sm'
                    }`}
                    style={{
                      animation: `slideInFromRight 0.3s ease-out ${index * 0.05}s forwards`,
                      opacity: 0,
                      transform: 'translateX(20px)'
                    }}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
