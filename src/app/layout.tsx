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
        {/* Title và Meta cơ bản */}
        <title>Billiard Club - Hệ thống quản lý bàn bi da</title>
        <meta name="description" content="Trải nghiệm không gian bi da đẳng cấp, đặt bàn online, quản lý thời gian chơi chuyên nghiệp" />
        
        {/* Open Graph / Facebook / Messenger / Zalo */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://t3.ftcdn.net/jpg/05/21/34/34/360_F_521343406_p5gaCZNkpK72FNEBtBOPiDKomHPXhew1.jpg" />
        <meta property="og:title" content="Billiard Club - Hệ thống quản lý bàn bi da" />
        <meta property="og:description" content="🎱 Đặt bàn bi da online | Quản lý thời gian chơi | Gọi đồ ăn thức uống | Trải nghiệm đẳng cấp" />
        <meta property="og:image" content="https://t3.ftcdn.net/jpg/05/21/34/34/360_F_521343406_p5gaCZNkpK72FNEBtBOPiDKomHPXhew1.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Billiard Club - Hệ thống quản lý bàn bi da chuyên nghiệp" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Billiard Club - Hệ thống quản lý bàn bi da" />
        <meta name="twitter:description" content="🎱 Đặt bàn bi da online | Quản lý thời gian chơi | Gọi đồ ăn thức uống" />
        <meta name="twitter:image" content="https://t3.ftcdn.net/jpg/05/21/34/34/360_F_521343406_p5gaCZNkpK72FNEBtBOPiDKomHPXhew1.jpg" />
      </Head>
      <body className={`${inter.className} bg-white dark:bg-black`}>
        <SocketProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
