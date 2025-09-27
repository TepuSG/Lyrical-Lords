'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function NicknameContent() {
  const [nickname, setNickname] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      // Navigate to lobby with both room code and nickname
      router.push(`/lobby?code=${encodeURIComponent(roomCode)}&nickname=${encodeURIComponent(nickname.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Room Code Display */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Room: {roomCode || 'Unknown'}
        </h1>
        <p className="text-lg text-gray-600">
          Choose your nickname to join the game
        </p>
      </div>

      {/* Nickname Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Enter your Nickname
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input 
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg text-black"
              maxLength={20}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Nickname() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>}>
      <NicknameContent />
    </Suspense>
  );
}