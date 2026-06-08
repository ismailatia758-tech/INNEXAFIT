'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/store/useAuth';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, accessToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (accessToken && user) {
      const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
        auth: { token: accessToken },
      });

      socketInstance.on('connect', () => setConnected(true));
      socketInstance.on('disconnect', () => setConnected(false));

      socketInstance.on('notification', (data) => {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-card shadow-2xl rounded-[1.5rem] pointer-events-auto flex border border-border ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                    <Bell size={20} />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-foreground">{data.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{data.message}</p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 5000 });
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [accessToken, user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
