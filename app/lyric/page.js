"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useSearchParams, useRouter } from 'next/navigation';

function LyricContent() {
  const [lyric, setLyric] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const router = useRouter();

  const { assignedSong, lyricsResults, submitLyrics, socket, roundProgress } = useSocket();

  useEffect(() => {
    // If assignedSong isn't present (e.g., user navigated here manually), redirect back to lobby
    if (!assignedSong) {
      // small grace period to allow assignment to arrive
      const t = setTimeout(() => router.push(`/lobby?code=${roomCode}`), 500);
      return () => clearTimeout(t);
    }
    // If lyrics results are already present, skip to results
    if (lyricsResults) {
      router.push(`/results?code=${roomCode}`);
    }
  }, [assignedSong]);

  useEffect(() => {
    if (lyricsResults) {
      router.push(`/results?code=${roomCode}`);
    }
  }, [lyricsResults]);

  const handleSubmit = () => {
    if (!lyric.trim()) return;
    const assignedIndex = assignedSong?.assignedIndex;
    if (typeof assignedIndex === 'number' && submitLyrics) {
      submitLyrics(roomCode, lyric.trim(), assignedIndex);
    } else if (socket) {
      socket.emit('submit-lyrics', { roomCode, lyrics: lyric.trim(), assignedIndex });
    }
    setLyric('');
    // mark as submitted locally so button is disabled while waiting for others
    setHasSubmitted(true);
    // Optionally navigate or show confirmation; server will emit progress/all-lyrics-submitted
  };

  // Reset submission state when a new assignment arrives (next round)
  useEffect(() => {
    if (assignedSong) {
      setHasSubmitted(false);
    }
  }, [assignedSong]);

  return (
    <div className="w-full">
      {/* Room Code at top */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Room: {roomCode}</h1>
      </div>

      {/* Card for lyric input */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md mx-auto">
  <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">{assignedSong && assignedSong.assignedTitle ? 'Write lyrics for this title' : 'Write the next lyric'}</h2>
        <div className="text-center mb-6">
          <div className="text-lg font-bold">
            {assignedSong ? (
              assignedSong.lastLyric ? assignedSong.lastLyric : (assignedSong.assignedTitle ? assignedSong.assignedTitle : 'Write the first lyric')
            ) : 'Waiting for assignment...'}
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={lyric}
            onChange={(e) => setLyric(e.target.value)}
            placeholder="Your lyric"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg text-black"
          />
          <button
            onClick={handleSubmit}
            disabled={hasSubmitted || !lyric.trim()}
            className={`w-full ${hasSubmitted ? 'bg-gray-400 cursor-default' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200`}
          >
            {hasSubmitted ? 'Waiting for others...' : 'Submit Lyric'}
          </button>
          {/* Show round progress if available */}
          {hasSubmitted && roundProgress && (
            <div className="text-center text-sm text-gray-600 mt-2">
              {roundProgress.submitted} of {roundProgress.total} submitted (Round {roundProgress.round} / {roundProgress.totalRounds})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Lyric() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>}>
      <LyricContent />
    </Suspense>
  );
}
