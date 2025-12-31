import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';


let socket: ReturnType<typeof io>;

export const useSocket = (fetchLogs: () => void, userId: string) => {
  const fetchRef = useRef(fetchLogs);

  useEffect(() => {
    fetchRef.current = fetchLogs;
  }, [fetchLogs]);

  useEffect(() => {
    
    socket = io('http://localhost:3000', {
      query: { userId } 
    });

    socket.on('PROACTIVE_ADVICE', (data: any) => {
      fetchRef.current();

      toast(`${data.message}`, {
        icon: '🤖',
        position: 'bottom-right',
        duration: 5000,
        style: {
          borderRadius: '12px',
          background: '#1A2332',
          color: '#fff',
          fontSize: '13px',
          borderLeft: '4px solid #00C2A0',
          padding: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        },
      });
    });

   
    return () => {
      socket.off('PROACTIVE_ADVICE');
      socket.disconnect();
    };
  }, [userId]); 
};