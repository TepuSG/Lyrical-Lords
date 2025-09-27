'use client';

import { useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useSearchParams } from 'next/navigation';

export default function Lyric() {
  const [lyric, setLyric] = useState('');
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const { socket } = useSocket();
  const { playerReady } = useSocket();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        {/* Room Code at top */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Room: {roomCode}
          </h1>
        </div>
        {/* Card for lyric input */}
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Enter your Lyric!
          </h2>
            <div className="space-y-4">
                <input
                    type="text"
                    value={lyric}
                    onChange={(e) => setLyric(e.target.value)}
                    placeholder="Your lyric"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg text-black"
                />
                <button
                    onClick={() => {
                        if (lyric.trim() && socket) {
                            socket.emit('submitLyric', { roomCode, lyric: lyric.trim() });
                            setLyric('');
                        }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
                >
                    Submit Lyric
                </button>
            </div>
        </div>
    </div>
  );
}   
