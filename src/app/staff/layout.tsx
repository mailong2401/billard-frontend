'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import StaffHeader from '@/components/staff/StaffHeader';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      <div className="min-h-screen bg-white dark:bg-black">
        <StaffHeader />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
