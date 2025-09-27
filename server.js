const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3001;

// Create Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Game rooms storage
const gameRooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  // Initialize Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('join-room', ({ roomCode, nickname }) => {
      socket.join(roomCode);
      
      // Initialize room if it doesn't exist
      if (!gameRooms.has(roomCode)) {
        gameRooms.set(roomCode, {
          players: [],
          gameState: 'lobby', // lobby, playing, finished
          currentRound: 0,
          songTitles: [],
          lyrics: []
        });
      }
      
      const room = gameRooms.get(roomCode);
      
      // Add player if not already in room
      if (!room.players.find(p => p.id === socket.id)) {
        room.players.push({
          id: socket.id,
          nickname: nickname,
          joinedAt: new Date()
        });
      }
      
      // Send updated player list to all players in room
      io.to(roomCode).emit('players-update', room.players);
      
      console.log(`${nickname} joined room ${roomCode}`);
    });

    // Start game
    socket.on('start-game', ({ roomCode }) => {
      const room = gameRooms.get(roomCode);
      if (room) {
        room.gameState = 'playing';
        io.to(roomCode).emit('game-started');
        console.log(`Game started in room ${roomCode}`);
      }
    });

    // Submit song title
    socket.on('submit-song-title', ({ roomCode, songTitle }) => {
      const room = gameRooms.get(roomCode);
      if (room) {
        room.songTitles.push({
          playerId: socket.id,
          title: songTitle,
          submittedAt: new Date()
        });
        
        // Check if all players have submitted
        if (room.songTitles.length === room.players.length) {
          io.to(roomCode).emit('all-titles-submitted', room.songTitles);
        } else {
          // Update progress
          io.to(roomCode).emit('submission-progress', {
            submitted: room.songTitles.length,
            total: room.players.length
          });
        }
      }
    });

    // Submit lyrics
    socket.on('submit-lyrics', ({ roomCode, lyrics, assignedSong }) => {
      const room = gameRooms.get(roomCode);
      if (room) {
        room.lyrics.push({
          playerId: socket.id,
          lyrics: lyrics,
          assignedSong: assignedSong,
          submittedAt: new Date()
        });
        
        // Check if all players have submitted lyrics
        if (room.lyrics.length === room.players.length) {
          io.to(roomCode).emit('all-lyrics-submitted', room.lyrics);
        } else {
          io.to(roomCode).emit('lyrics-progress', {
            submitted: room.lyrics.length,
            total: room.players.length
          });
        }
      }
    });

    // Leave room
    socket.on('leave-room', ({ roomCode }) => {
      socket.leave(roomCode);
      const room = gameRooms.get(roomCode);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        io.to(roomCode).emit('players-update', room.players);
        
        // Remove room if empty
        if (room.players.length === 0) {
          gameRooms.delete(roomCode);
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove player from all rooms
      gameRooms.forEach((room, roomCode) => {
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          io.to(roomCode).emit('players-update', room.players);
          
          // Remove room if empty
          if (room.players.length === 0) {
            gameRooms.delete(roomCode);
          }
        }
      });
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});