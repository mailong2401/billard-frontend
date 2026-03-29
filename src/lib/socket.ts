import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

    console.log('🔥 Creating GLOBAL socket...');

    socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socket;
};
