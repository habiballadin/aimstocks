import { useState, useEffect } from 'react';

interface UseRealTimeDataReturn<T> {
  data: T | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export const useRealTimeData = <T = unknown>(endpoint: string): UseRealTimeDataReturn<T> => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reconnect = () => {
    // In a real app, this would reconnect to WebSocket
    setIsConnected(false);
    setTimeout(() => {
      setIsConnected(true);
      setError(null);
    }, 1000);
  };

  useEffect(() => {
    // Simulate WebSocket connection
    const timer = setTimeout(() => {
      setIsConnected(true);
      setData({ connected: true, endpoint });
    }, 1000);

    // Simulate periodic data updates
    const interval = setInterval(() => {
      if (isConnected) {
        setData({
          connected: true,
          endpoint,
          lastUpdate: new Date().toISOString(),
          randomData: Math.random()
        });
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [endpoint, isConnected]);

  return {
    data,
    isConnected,
    error,
    reconnect
  };
};