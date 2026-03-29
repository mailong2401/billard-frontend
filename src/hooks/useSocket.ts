'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

export const useSocket = () => {
  const socket = getSocket(); // ✅ dùng chung 1 socket
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => {
      console.log('✅ Connected:', socket.id);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ Disconnected');
      setIsConnected(false);
    };

    const handleError = (err: any) => {
      console.error('❌ Socket error:', err);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);

    // ❗ KHÔNG disconnect nữa
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
    };
  }, [socket]);

  // ✅ emit chuẩn
  const emit = useCallback((event: string, data?: any, callback?: (res: any) => void) => {
    if (socket.connected) {
      console.log(`📤 Emit: ${event}`, data);
      socket.emit(event, data, callback);
    } else {
      console.warn(`⚠️ Not connected: ${event}`);
      callback?.({ success: false, error: 'Socket not connected' });
    }
  }, [socket]);

  // ✅ tránh duplicate listener
  const on = useCallback((event: string, callback: (data: any) => void) => {
    socket.off(event, callback); // 🔥 tránh bị đăng ký nhiều lần
    socket.on(event, callback);
  }, [socket]);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    socket.off(event, callback);
  }, [socket]);

  return {
    socket,
    isConnected,
    emit,
    on,
    off,
  };
};
