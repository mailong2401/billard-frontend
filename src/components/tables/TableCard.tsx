'use client';

import { Table } from '@/types';
import { TABLE_STATUS, TABLE_TYPE } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';
import { BiEdit, BiTrash, BiCalendar } from 'react-icons/bi';

interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (id: number) => void;
  onBook: (table: Table) => void;
}

export default function TableCard({ table, onEdit, onDelete, onBook }: TableCardProps) {
  const status = TABLE_STATUS[table.status];
  const type = TABLE_TYPE[table.table_type];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{table.table_name}</h3>
            <p className="text-sm text-gray-500">{table.table_number}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Loại bàn:</span>
            <span className="font-medium text-gray-900">{type.label}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Giá:</span>
            <span className="font-medium text-blue-600">{formatCurrency(table.price_per_hour)}</span>
          </div>
          {table.location && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Vị trí:</span>
              <span className="font-medium text-gray-900">{table.location}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onBook(table)}
            disabled={table.status !== 'available'}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              table.status === 'available'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <BiCalendar className="h-4 w-4" />
            <span>Đặt bàn</span>
          </button>
          <button
            onClick={() => onEdit(table)}
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <BiEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(table.id)}
            className="px-3 py-2 rounded-md text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
          >
            <BiTrash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
