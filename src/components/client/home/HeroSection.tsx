'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
          Chào mừng đến với Billiard Club
        </h1>
        <p className="text-primary-100 mb-4 text-lg">
          Trải nghiệm không gian bi da đẳng cấp
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/client/tables"
            className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
          >
            Xem bàn trống
          </Link>
          <Link
            href="/client/booking"
            className="bg-transparent border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 hover:scale-105"
          >
            Đặt bàn ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
