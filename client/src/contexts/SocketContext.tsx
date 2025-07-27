import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get backend URL from environment variables
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    // Connect to the backend server using environment variables
    const newSocket = io(backendUrl, {
      autoConnect: import.meta.env.VITE_SOCKET_AUTO_CONNECT !== 'false',
      reconnection: import.meta.env.VITE_SOCKET_RECONNECTION !== 'false',
      reconnectionAttempts: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_ATTEMPTS) || 5,
      reconnectionDelay: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY) || 1000,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server:', newSocket.id);
      console.log('Backend URL:', backendUrl);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};