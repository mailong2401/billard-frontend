'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BiHome, 
  BiTable, 
  BiCalendar, 
  BiCoffee, 
  BiUser,
  BiMenu,
  BiX,
  BiWifi,
  BiWifiOff,
  BiLogOut
} from 'react-icons/bi';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function Header() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected } = useSocket();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

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
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-700 rounded-xl"></div>
              <div>
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white/60 dark:bg-black/60 backdrop-blur-md`}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent"></div>
        
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <Link 
              href="/client" 
              className="group flex items-center space-x-2 hover:opacity-90 transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <span className="text-white text-xl transform group-hover:scale-110 transition-transform duration-300">🎱</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                  Billiard Club
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
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
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
                    }`}
                  >
                    <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                      active ? 'text-sky-600' : ''
                    }`} />
                    <span className="font-medium">{item.label}</span>
                    
                    {active && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-sky-600 rounded-full"></span>
                    )}
                    
                    <span className="absolute inset-0 rounded-lg bg-sky-50/50 dark:bg-sky-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 backdrop-blur-sm"></span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>



              {/* User Info */}
              {user && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-sky-50/80 to-sky-100/80 dark:from-sky-900/30 dark:to-sky-900/40 backdrop-blur-sm rounded-full border border-sky-200/50 dark:border-sky-800/50">
                  <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                    <BiUser className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-sky-700 dark:text-sky-300">
                    {user.full_name || user.username}
                  </span>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm rounded-full border border-red-200/50 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                title="Đăng xuất"
              >
                <BiLogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Đăng xuất
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-110"
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

      {/* Spacer */}
      <div className="h-[73px]"></div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-[73px] z-40 transition-all duration-500 ease-in-out ${
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100 visible'
            : '-translate-y-full opacity-0 invisible'
        }`}
      >
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="container mx-auto px-4 py-4">
            {/* User Info Mobile */}
            {user && (
              <div className="flex items-center justify-between p-4 mb-4 bg-gradient-to-r from-sky-50/80 to-sky-100/80 dark:from-sky-900/30 dark:to-sky-900/40 backdrop-blur-sm rounded-xl border border-sky-200/50 dark:border-sky-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
                    <BiUser className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-xs text-slate-500">Khách hàng thân thiết</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  {isConnected ? (
                    <BiWifi className="h-4 w-4 text-emerald-500" />
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
                        ? 'bg-sky-50/80 dark:bg-sky-900/30 backdrop-blur-sm text-sky-600 dark:text-sky-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 backdrop-blur-sm'
                    }`}
                    style={{
                      animation: `slideInFromRight 0.3s ease-out ${index * 0.05}s forwards`,
                      opacity: 0,
                      transform: 'translateX(20px)'
                    }}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-sky-600' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 bg-sky-600 rounded-full animate-pulse"></span>
                    )}
                  </Link>
                );
              })}
              
              {/* Logout Button Mobile */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-red-600 hover:bg-red-50/80 dark:hover:bg-red-900/30"
              >
                <BiLogOut className="h-5 w-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
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
