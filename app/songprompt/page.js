'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '../../contexts/SocketContext';

function SongPromptContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const [songTitle, setSongTitle] = useState('');
  const { socket } = useSocket();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Room Code at top */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Room: {roomCode}
        </h1>
      </div>

      {/* Song Prompt Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Enter your Original Song Title!
        </h2>
        
        <div className="space-y-4">
          <input 
            type="text" 
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="Song Title" 
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg text-black"
          />
          <button 
            onClick={() => {
              if (songTitle.trim() && socket) {
                socket.emit('submitSongTitle', { roomCode, title: songTitle.trim() });
                setSongTitle('');
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
          >
            Submit Song Title
          </button>
        </div>
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