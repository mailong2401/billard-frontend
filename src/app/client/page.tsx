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

  // ================= REALTIME UPDATES =================
  useEffect(() => {
    if (!socket || !isClient) return;

    // Khi bàn được cập nhật
    const handleTableUpdated = (updatedTable: any) => {
      setTables(prev => prev.map(t => 
        t.id === updatedTable.id ? updatedTable : t
      ));
    };

    // Khi trạng thái bàn thay đổi
    const handleTableStatusChanged = (updatedTable: any) => {
      setTables(prev => prev.map(t => 
        t.id === updatedTable.id ? updatedTable : t
      ));
    };

    // Khi có bàn mới được tạo
    const handleTableCreated = (newTable: any) => {
      if (newTable.status === 'available') {
        setTables(prev => [newTable, ...prev]);
      }
    };

    // Khi bàn bị xóa
    const handleTableDeleted = ({ tableId }: { tableId: number }) => {
      setTables(prev => prev.filter(t => t.id !== tableId));
    };

    // Khi có booking mới (ảnh hưởng đến trạng thái bàn)
    const handleNewBooking = (booking: any) => {
      if (booking.table_id) {
        setTables(prev => prev.map(t =>
          t.id === booking.table_id
            ? { ...t, status: 'reserved' }
            : t
        ));
      }
    };

    // Khi booking được cập nhật (check-in, check-out, cancel)
    const handleBookingUpdated = (updated: any) => {
      if (updated.table_id) {
        let newStatus = 'available';
        if (updated.status === 'checked_in') newStatus = 'occupied';
        else if (updated.status === 'confirmed') newStatus = 'reserved';
        else if (updated.status === 'completed') newStatus = 'available';
        else if (updated.status === 'cancelled') newStatus = 'available';
        
        setTables(prev => prev.map(t =>
          t.id === updated.table_id
            ? { ...t, status: newStatus }
            : t
        ));
      }
    };

    // Đăng ký listeners
    socket.on('table-created', handleTableCreated);
    socket.on('table-updated', handleTableUpdated);
    socket.on('table-deleted', handleTableDeleted);
    socket.on('table-status-changed', handleTableStatusChanged);
    socket.on('new-booking', handleNewBooking);
    socket.on('booking-updated', handleBookingUpdated);
    socket.on('booking-cancelled', handleBookingUpdated);

    return () => {
      socket.off('table-created', handleTableCreated);
      socket.off('table-updated', handleTableUpdated);
      socket.off('table-deleted', handleTableDeleted);
      socket.off('table-status-changed', handleTableStatusChanged);
      socket.off('new-booking', handleNewBooking);
      socket.off('booking-updated', handleBookingUpdated);
      socket.off('booking-cancelled', handleBookingUpdated);
    };
  }, [socket, isClient]);

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
