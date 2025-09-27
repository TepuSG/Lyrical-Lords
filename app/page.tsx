'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [roomCode, setRoomCode] = useState('');

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      // Navigate to nickname page with room as query param
      router.push(`/nickname?room=${encodeURIComponent(roomCode.trim())}`);
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Main Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Valiant Voices
        </h1>
        <p className="text-lg text-gray-600">
          Join the musical storytelling adventure
        </p>
      </div>

      {/* Join Room Box */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Join Game Room
        </h2>
        
        <form onSubmit={handleJoinRoom}>
          <div className="mb-4">
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono text-black"
              maxLength={6}
              required
            />
          </div>
          
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}