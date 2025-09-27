"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSocket } from '../../contexts/SocketContext';

function SongPromptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get('code') || '';
  const [songTitle, setSongTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState({ submitted: 0, total: 0 });
  const [allTitles, setAllTitles] = useState(null);

  const { socket, submitSongTitle, players, assignedSong } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const onProgress = (data) => {
      setProgress(data);
    };

    socket.on('submission-progress', onProgress);

    return () => {
      socket.off('submission-progress', onProgress);
    };
  }, [socket]);

  useEffect(() => {
    // keep initial progress in sync with players count
    if (players && players.length && (!progress.total || progress.total !== players.length)) {
      setProgress((p) => ({ ...p, total: players.length }));
    }
  }, [players]);

  const handleSubmit = () => {
    if (!songTitle.trim()) return;
    if (submitSongTitle) {
      submitSongTitle(roomCode, songTitle.trim());
    } else if (socket) {
      // fallback if helper isn't available
      socket.emit('submit-song-title', { roomCode, songTitle: songTitle.trim() });
    }
    setSongTitle('');
    setSubmitted(true);
  };

  // If assignedSong becomes available in context, automatically navigate to lyric page.
  useEffect(() => {
    if (assignedSong) {
      // Navigate to lyric page; the assignedSong is stored in context so no need to pass it via URL
      router.push(`/lyric?code=${roomCode}`);
    }
  }, [assignedSong]);

  return (
    <div className="w-full">
      {/* Room Code at top */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Room: {roomCode}</h1>
      </div>

      {/* Song Prompt Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md mx-auto">
        {!submitted && !assignedSong && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Enter your Original Song Title!</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="Song Title"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg text-black"
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
              >
                Submit Song Title
              </button>
            </div>
          </>
        )}

        {submitted && !assignedSong && (
          <div className="text-center">
            <h3 className="text-xl font-medium mb-4">Waiting for other players...</h3>
            <div className="text-sm text-gray-600">
              {progress && progress.total ? (
                <span>{progress.submitted} of {progress.total} submitted</span>
              ) : (
                <span>Waiting for players to connect...</span>
              )}
            </div>
          </div>
        )}
        {/* assignedSong will trigger navigation automatically; do not reveal other players' titles here */}
      </div>
    </div>
  );
}

export default function SongPrompt() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>}>
      <SongPromptContent />
    </Suspense>
  );
}