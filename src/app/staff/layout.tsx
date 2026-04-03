'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      <div className="min-h-screen bg-white dark:bg-black">
        {children}
      </div>
    </ProtectedRoute>
  );
}
