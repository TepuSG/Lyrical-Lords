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
  // Prepare allowed origins safely — filter out undefined values and fall back to '*'
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.RENDER_EXTERNAL_URL, process.env.FRONTEND_URL].filter(Boolean)
    : ['*'];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : ['*'],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    try {
      console.log(' Socket handshake origin:', socket.handshake && socket.handshake.headers && socket.handshake.headers.origin);
    } catch (e) {
      // ignore
    }

    // Join a room
    socket.on('join-room', ({ roomCode, nickname }) => {
      // If the room exists and has been frozen (title phase finished), reject late joins
      if (gameRooms.has(roomCode)) {
        const existingRoom = gameRooms.get(roomCode);
        if (existingRoom.frozen || existingRoom.gameState !== 'lobby') {
          socket.emit('join-error', { message: 'Room is closed for joining. The game is already in progress.' });
          console.log(`Rejected join for ${nickname} to room ${roomCode} (frozen or in-progress)`);
          return;
        }
      }

      socket.join(roomCode);

      // Initialize room if it doesn't exist
      if (!gameRooms.has(roomCode)) {
        gameRooms.set(roomCode, {
          players: [],
          gameState: 'lobby', // lobby, playing, finished
          currentRound: 0,
          songTitles: [],
          songs: [],
          lyrics: [],
          frozen: false
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
      console.log(`Room ${roomCode} now has ${room.players.length} player(s):`, room.players.map(p => p.id));
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

    // Submit song title and initialize songs when all titles are in
    socket.on('submit-song-title', ({ roomCode, songTitle }) => {
      const room = gameRooms.get(roomCode);
      if (room) {
        room.songTitles.push({
          playerId: socket.id,
          title: songTitle,
          submittedAt: new Date()
        });

        // Acknowledge back to the submitting client so they know server received it
        try {
          io.to(socket.id).emit('title-ack', {
            submitted: room.songTitles.length,
            total: room.players.length
          });
        } catch (err) {
          console.error('Error sending title-ack', err);
        }

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
          // Build songs array in the same order as room.players
          const players = room.players.slice();
          const titles = room.songTitles.slice();
          const n = players.length;

          room.songs = players.map((p) => {
            const t = titles.find(tt => tt.playerId === p.id);
            return {
              title: t ? t.title : 'Untitled',
              authorId: p.id,
              authorNickname: p.nickname,
              lyrics: []
            };
          });

          room.totalRounds = n; // option A: everyone writes every song
          room.currentRound = 0;
          room.roundSubmissions = 0;
          room.roundSubmittedPlayerIds = new Set();
          // Freeze the player list to prevent late joins / changes
          room.frozen = true;
          io.to(roomCode).emit('players-frozen', { message: 'Player list frozen. Game in progress.' });

          // Helper to emit assignments for the current round
          function emitAssignmentsForRound(r) {
            // We offset by +1 so that on r=0 each player receives someone else's song for the first lyric.
            for (let i = 0; i < n; i++) {
              const player = players[i];
              const assignedIndex = (i + r + 1) % n;
              const song = room.songs[assignedIndex];
              const lastLyric = song.lyrics.length > 0 ? song.lyrics[song.lyrics.length - 1].text : null;
              // Reveal the title only on the very first lyric round (r === 0) to the assigned writer — not the author
              const showTitle = (song.lyrics.length === 0 && r === 0);
              io.to(player.id).emit('assign-lyric', {
                assignedIndex,
                assignedTitle: showTitle ? song.title : null,
                lastLyric,
                round: r + 1,
                totalRounds: room.totalRounds,
                roomCode
              });
            }
          }

          // Start first round
          emitAssignmentsForRound(0);
        } else {
          // Update progress
          io.to(roomCode).emit('submission-progress', {
            submitted: room.songTitles.length,
            total: room.players.length
          });
        }
      }
    });

    // Submit lyrics for a given assignedIndex (round-based)
    socket.on('submit-lyrics', ({ roomCode, lyrics, assignedIndex }) => {
      const room = gameRooms.get(roomCode);
      if (room && typeof assignedIndex === 'number') {
        // Prevent duplicate submissions in the same round by same player
        if (!room.roundSubmittedPlayerIds) room.roundSubmittedPlayerIds = new Set();
        if (room.roundSubmittedPlayerIds.has(socket.id)) {
          // ignore duplicate
          return;
        }

        // Append lyric to the correct song
        if (!room.songs || !room.songs[assignedIndex]) return;

        room.songs[assignedIndex].lyrics.push({
          playerId: socket.id,
          text: lyrics,
          submittedAt: new Date()
        });

        room.roundSubmittedPlayerIds.add(socket.id);
        room.roundSubmissions = (room.roundSubmissions || 0) + 1;

        // Emit round progress to the room
        io.to(roomCode).emit('round-progress', {
          submitted: room.roundSubmissions,
          total: room.players.length,
          round: room.currentRound + 1,
          totalRounds: room.totalRounds
        });

        // If all players submitted for this round, advance
        if (room.roundSubmissions >= room.players.length) {
          // reset for next round
          room.roundSubmissions = 0;
          room.roundSubmittedPlayerIds = new Set();
          room.currentRound = (room.currentRound || 0) + 1;

          if (room.currentRound < room.totalRounds) {
            // emit next round assignments
            for (let i = 0; i < room.players.length; i++) {
              const player = room.players[i];
              // Keep the same +1 offset applied at the start so assignments rotate correctly
              const assignedIndex = (i + room.currentRound + 1) % room.players.length;
              const song = room.songs[assignedIndex];
              const lastLyric = song.lyrics.length > 0 ? song.lyrics[song.lyrics.length - 1].text : null;

              // After the first round, titles should not be revealed (first-round reveal handled earlier)
              io.to(player.id).emit('assign-lyric', {
                assignedIndex,
                assignedTitle: null,
                lastLyric,
                round: room.currentRound + 1,
                totalRounds: room.totalRounds,
                roomCode
              });
            }
          } else {
            // All rounds complete — send final songs
            io.to(roomCode).emit('all-songs-complete', room.songs);
          }
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
      console.log(' Socket allowed origins:', allowedOrigins.length ? allowedOrigins : ['*']);
    });
});
