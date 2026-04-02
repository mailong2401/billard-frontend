'use client';

import { BiTable, BiPlay } from 'react-icons/bi';

interface StatsProps {
  availableTables: number;
  vipTables: number;
}

export default function Stats({ availableTables, vipTables }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400">Bàn trống</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{availableTables}</p>
          </div>
          <BiTable className="h-12 w-12 text-emerald-500 dark:text-emerald-400" />
        </div>
      </div>
      
<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400">Bàn VIP</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{vipTables}</p>
          </div>
          <BiTable className="h-12 w-12 text-purple-500 dark:text-purple-400" />
        </div>
      </div>
      
<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400">Giá từ</p>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">50,000₫/h</p>
          </div>
          <BiPlay className="h-12 w-12 text-sky-500 dark:text-sky-400" />
        </div>
      </div>
    </div>
  );
}
