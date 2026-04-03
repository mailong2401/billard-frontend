'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from '@/contexts/SocketContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <Head>
        <title>Billiard Club - Hệ thống quản lý bàn bi da</title>
        <meta name="description" content="Trải nghiệm không gian bi da đẳng cấp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body 
        className={`${inter.className} bg-cover bg-center bg-fixed bg-no-repeat`}
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
        {/* Overlay để tăng độ tương phản cho nội dung */}
        <div className="min-h-screen bg-black/50 backdrop-blur-sm">
          <SocketProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </SocketProvider>
        </div>
      </body>
    </html>
  );
}
