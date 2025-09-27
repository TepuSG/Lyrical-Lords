'use client';

import { Suspense, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useSearchParams } from 'next/navigation';

function ResultsContent() {
  const { lyricsResults } = useSocket();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';

  useEffect(() => {
    // If there's no results, we could redirect back or show a message
  }, [lyricsResults]);

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Room: {roomCode}</h1>
        <h2 className="text-xl text-gray-700">Collected Lyrics</h2>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl mx-auto">
        {!lyricsResults && (
          <div className="text-center text-gray-600">Waiting for results...</div>
        )}

        {lyricsResults && (
          <ul className="space-y-4">
            {lyricsResults.map((r, idx) => (
              <li key={idx} className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500 mb-2">Assigned title: <strong>{r.assignedSong}</strong></div>
                <div className="text-lg">{r.lyrics}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>}>
      <ResultsContent />
    </Suspense>
  );
}
