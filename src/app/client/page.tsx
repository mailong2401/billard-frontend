'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import BannerSlider from '@/components/client/home/BannerSlider';
import HeroSection from '@/components/client/home/HeroSection';
import Stats from '@/components/client/home/Stats';
import AboutSection from '@/components/client/home/AboutSection';
import FeaturedTables from '@/components/client/home/FeaturedTables';
import QuickLinks from '@/components/client/home/QuickLinks';
import LoadingSpinner from '@/components/client/LoadingSpinner';

interface Table {
  id: number;
  table_number: string;
  table_name: string;
  table_type: string;
  price_per_hour: number;
  status: string;
  location?: string;
}

export default function ClientHome() {
  const { socket, isConnected } = useSocket();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadTables = useCallback(() => {
    socket?.emit('get-tables', { status: 'available' }, (res: any) => {
      if (res.success) {
        setTables(res.data);
      }
      setLoading(false);
    });
  }, [socket]);

  useEffect(() => {
    if (isClient && socket && isConnected) {
      loadTables();
    }
  }, [isClient, socket, isConnected, loadTables]);

  if (!isClient || !isConnected || loading) {
    return <LoadingSpinner />;
  }

  const availableTables = tables.filter(t => t.status === 'available').length;
  const vipTables = tables.filter(t => t.table_type === 'vip').length;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Banner Slider */}
      <div className="mb-8">
        <BannerSlider 
          autoPlayInterval={5000}
          showControls={true}
          showIndicators={true}
          height="h-[400px] md:h-[500px]"
        />
      </div>

      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <HeroSection />

        {/* Stats */}
        <Stats availableTables={availableTables} vipTables={vipTables} />

        {/* About Section */}
        <AboutSection />

        {/* Featured Tables */}
        <FeaturedTables tables={tables} />

        {/* Quick Links */}
        <QuickLinks />
      </div>
    </div>
  );
}
