'use client';

import TableCardClient from '@/components/client/TableCardClient';

interface Table {
  id: number;
  table_number: string;
  table_name: string;
  table_type: string;
  price_per_hour: number;
  status: string;
  location?: string;
}

interface FeaturedTablesProps {
  tables: Table[];
}

export default function FeaturedTables({ tables }: FeaturedTablesProps) {
  if (tables.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          Hiện không có bàn trống nào
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Bàn trống gần đây
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.slice(0, 3).map((table) => (
          <TableCardClient key={table.id} table={table} />
        ))}
      </div>
    </div>
  );
}
