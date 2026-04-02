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
      color: 'text-orange-500'
    },
    {
      href: '/client/booking',
      icon: BiCalendar,
      title: 'Đặt bàn',
      description: 'Đặt trước bàn ưa thích',
      color: 'text-green-500'
    },
    {
      href: '/client/profile',
      icon: BiUser,
      title: 'Hồ sơ',
      description: 'Lịch sử đặt bàn',
      color: 'text-blue-500'
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
            className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group"
          >
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon className={`h-8 w-8 ${link.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text mb-2">
              {link.title}
            </h3>
            <p className="text-gray-500 dark:text-macchiato-subtext text-sm">
              {link.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
