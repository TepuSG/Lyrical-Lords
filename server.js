const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || 3002;

// Create Next.js app
const app = next({ dev, hostname: dev ? hostname : undefined, port });
const handler = app.getRequestHandler();

// Game rooms storage
const gameRooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  // Initialize Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.RENDER_EXTERNAL_URL, process.env.FRONTEND_URL] 
        : "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
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

        // DEBUG: log current submission state for this room
        try {
          console.log(`Room ${roomCode} submissions: ${room.songTitles.length}/${room.players.length}`);
          console.log(' Players:', room.players.map(p => ({ id: p.id, nickname: p.nickname })));
          console.log(' Titles:', room.songTitles.map(t => ({ playerId: t.playerId, title: t.title })));
        } catch (err) {
          console.error('Error logging room state', err);
        }

        // Check if all players have submitted
        if (room.songTitles.length === room.players.length) {
          // Assign each player a title that they did NOT submit.
          // Build arrays of players and titles
          const players = room.players.slice(); // [{id, nickname}]
          const titles = room.songTitles.slice(); // [{playerId, title}]

          // Create an array of indices for titles and derange until no index matches the same player
          const n = players.length;
          let indices = Array.from({ length: n }, (_, i) => i);

          // Helper: shuffle array in-place
          function shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
          }

          // Attempt to derange: shuffle until no player gets their own title
          let attempts = 0;
          do {
            shuffle(indices);
            attempts++;
            // If too many attempts (unlikely), break and allow possible conflicts
            if (attempts > 1000) break;
          } while (indices.some((idx, i) => titles[idx].playerId === players[i].id));

          // Emit assigned title to each player privately and then signal start of lyrics phase
          for (let i = 0; i < n; i++) {
            const player = players[i];
            const assignedTitleObj = titles[indices[i]];
            const fromPlayer = room.players.find(p => p.id === assignedTitleObj.playerId);
            const fromNickname = fromPlayer ? fromPlayer.nickname : 'Unknown';

            // Send assigned title only to the specific player
            io.to(player.id).emit('start-lyrics', {
              assignedTitle: assignedTitleObj.title,
              assignedFrom: fromNickname,
              roomCode
            });
          }
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
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server ready`);
    });
});