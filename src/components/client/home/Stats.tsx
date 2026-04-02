'use client';

import { BiTable, BiPlay, BiTrophy } from 'react-icons/bi';

interface StatsProps {
  availableTables: number;
  vipTables: number;
}

export default function Stats({ availableTables, vipTables }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-macchiato-subtext">Bàn trống</p>
            <p className="text-3xl font-bold text-green-600">{availableTables}</p>
          </div>
          <BiTable className="h-12 w-12 text-green-500" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-macchiato-subtext">Bàn VIP</p>
            <p className="text-3xl font-bold text-purple-600">{vipTables}</p>
          </div>
          <BiTable className="h-12 w-12 text-purple-500" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-macchiato-subtext">Giá từ</p>
            <p className="text-2xl font-bold text-blue-600">50,000₫/h</p>
          </div>
          <BiPlay className="h-12 w-12 text-blue-500" />
        </div>
      </div>
    </div>
  );
}
