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
  const [assignedSong, setAssignedSong] = useState(null);
  const [lyricsResults, setLyricsResults] = useState(null);
  const [roundProgress, setRoundProgress] = useState(null);
  const [roomFrozen, setRoomFrozen] = useState(false);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    // Prefer an explicit public URL (NEXT_PUBLIC_SITE_URL). In development, default to the same hostname
    // but use the socket server port (default 3002). This avoids trying to open a websocket to the
    // frontend origin when the Socket.IO server runs on a different port.
  // Allow an explicit socket URL for deployed environments (e.g. https://valiantvoices.onrender.com)
  // This prevents the client from appending a default port like :3002 which will break wss on platforms
  // that terminate TLS at the platform/proxy.
  const explicitSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL; // e.g. https://valiantvoices.onrender.com or https://valiantvoices.onrender.com:3002
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const defaultSocketPort = process.env.NEXT_PUBLIC_SOCKET_PORT || '3002';

  const socketUrl = explicitSocketUrl || siteUrl || 
            (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:${defaultSocketPort}` : `http://localhost:${defaultSocketPort}`);

    console.log('Connecting to Socket.IO server:', socketUrl);
    try {
      const urlObj = new URL(socketUrl);
      if (urlObj.port && urlObj.port !== '80' && urlObj.port !== '443' && typeof window !== 'undefined' && window.location.protocol === 'https:') {
        console.warn('Socket URL uses a non-standard port while page is HTTPS. This may fail on hosted platforms that proxy TLS. Consider setting NEXT_PUBLIC_SOCKET_URL to your deployed origin (no port).');
      }
    } catch (e) {
      // ignore malformed URL parsing
    }

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    
    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    // Handle connection errors (e.g. server not running)
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connect error:', err);
      setIsConnected(false);
    });

    socketInstance.on('error', (err) => {
      console.error('Socket general error:', err);
    });

    socketInstance.on('reconnect_error', (err) => {
      console.error('Socket reconnect error:', err);
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

    // Assigned song/title for the lyrics phase (private per-player)
    // Server emits 'assign-lyric' for each round assignment
    socketInstance.on('assign-lyric', (payload) => {
      // payload: { assignedIndex, assignedTitle, lastLyric, round, totalRounds, roomCode }
      // new assignment -> clear any prior round progress
      setRoundProgress(null);
      setAssignedSong(payload);
    });

    // When all rounds complete server emits 'all-songs-complete' with final songs
    socketInstance.on('all-songs-complete', (payload) => {
      // payload: array of song objects { title, authorId, authorNickname, lyrics }
      setLyricsResults(payload);
    });

    // Round progress updates (how many players submitted their lyric for the current round)
    socketInstance.on('round-progress', (data) => {
      // data: { submitted, total, round, totalRounds }
      setRoundProgress(data);
    });

    socketInstance.on('players-frozen', (data) => {
      console.log('Players frozen:', data);
      setRoomFrozen(true);
    });

    socketInstance.on('join-error', (data) => {
      console.warn('Join error:', data);
      setJoinError(data && data.message ? data.message : 'Unable to join room');
    });

    // Acknowledgement from server that title submission was received
    socketInstance.on('title-ack', (data) => {
      console.log('Server acknowledged title submission:', data);
      // Could set local state or provide UI feedback if desired
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

  // Submit lyric for the currently assigned song index
  const submitLyrics = (roomCode, lyrics, assignedIndex) => {
    if (socket) {
      socket.emit('submit-lyrics', { roomCode, lyrics, assignedIndex });
    }
  };

  const clearAssignedSong = () => setAssignedSong(null);

  const clearLyricsResults = () => setLyricsResults(null);

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
    assignedSong,
    roundProgress,
    roomFrozen,
    joinError,
    lyricsResults,
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