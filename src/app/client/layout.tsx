'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/client/Header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['client']}>
      <div className="min-h-screen bg-gray-50 dark:bg-macchiato-base">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
