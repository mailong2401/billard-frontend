'use client';

import Link from 'next/link';
import { BiCoffee, BiCalendar, BiUser } from 'react-icons/bi';

export default function QuickLinks() {
  const links = [
    {
      href: '/client/menu',
      icon: BiCoffee,
      title: 'Menu',
      description: 'Đồ ăn & thức uống',
      color: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
    },
    {
      href: '/client/booking',
      icon: BiCalendar,
      title: 'Đặt bàn',
      description: 'Đặt trước bàn ưa thích',
      color: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
    },
    {
      href: '/client/profile',
      icon: BiUser,
      title: 'Hồ sơ',
      description: 'Lịch sử đặt bàn',
      color: 'text-sky-500 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-900/20',
      hoverBg: 'hover:bg-sky-100 dark:hover:bg-sky-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {links.map((link, index) => {
        const Icon = link.icon;
        return (
          <Link
            key={index}
            href={link.href}
            className={`bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group ${link.hoverBg}`}
          >
            <div className={`w-16 h-16 ${link.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`h-8 w-8 ${link.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {link.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {link.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
