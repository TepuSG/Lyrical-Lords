'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('lobby');

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
    
    console.log('Connecting to Socket.IO server:', socketUrl);
    
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    
    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('players-update', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socketInstance.on('game-started', () => {
      setGameState('playing');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.close();
    };
  }, []);

  const joinRoom = (roomCode, nickname) => {
    if (socket) {
      socket.emit('join-room', { roomCode, nickname });
    }
  };

  const startGame = (roomCode) => {
    if (socket) {
      socket.emit('start-game', { roomCode });
    }
  };

  const submitSongTitle = (roomCode, songTitle) => {
    if (socket) {
      socket.emit('submit-song-title', { roomCode, songTitle });
    }
  };

  const submitLyrics = (roomCode, lyrics, assignedSong) => {
    if (socket) {
      socket.emit('submit-lyrics', { roomCode, lyrics, assignedSong });
    }
  };

  const leaveRoom = (roomCode) => {
    if (socket) {
      socket.emit('leave-room', { roomCode });
    }
  };

  const value = {
    socket,
    isConnected,
    players,
    gameState,
    joinRoom,
    startGame,
    submitSongTitle,
    submitLyrics,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}