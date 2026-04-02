'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <Sidebar />
        <main className="transition-all duration-300 min-h-screen">
          <div className="pl-0 md:pl-20 lg:pl-64">
            <div className="p-4 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
