'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import { SocketProvider } from '@/contexts/SocketContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-macchiato-mantle transition-colors duration-300">
            <Sidebar />
            <main className="transition-all duration-300 min-h-screen">
              <div className="pl-0 md:pl-20 lg:pl-64">
                <div className="p-4 md:p-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
          <Toaster position="top-right" />
        </SocketProvider>
      </body>
    </html>
  );
}
