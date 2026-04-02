'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <Sidebar onCollapsedChange={setIsSidebarCollapsed} />
        <main className="transition-all duration-300 min-h-screen">
          {/* Khoảng cách thay đổi dựa trên trạng thái sidebar */}
          <div className={`transition-all duration-300 ${
            isSidebarCollapsed ? 'pl-0 md:pl-20' : 'pl-0 md:pl-64'
          }`}>
            <div className="p-4 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
