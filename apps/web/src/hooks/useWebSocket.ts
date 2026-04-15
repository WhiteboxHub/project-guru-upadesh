import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';

export interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();

  const connect = useCallback(() => {
    if (!token) return;

    const socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    socket.on('message', (message: WebSocketMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, data);
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const unsubscribe = useCallback((event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  return {
    isConnected,
    messages,
    sendMessage,
    subscribe,
    unsubscribe,
    disconnect,
  };
}
