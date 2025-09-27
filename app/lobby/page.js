'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '../../contexts/SocketContext';

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { players, isConnected, joinRoom, startGame, gameState } = useSocket();
  
  const roomCode = searchParams.get('code') || 'what12';
  const nickname = searchParams.get('nickname') || 'Player';

  useEffect(() => {
    // Join room when component mounts
    if (isConnected && roomCode) {
      joinRoom(roomCode, nickname);
    }
  }, [isConnected, roomCode, nickname]);

  useEffect(() => {
    // Navigate to song prompt when game starts
    if (gameState === 'playing') {
      router.push(`/songprompt?code=${roomCode}&nickname=${nickname}`);
    }
  }, [gameState, router, roomCode, nickname]);

  const handleStartGame = () => {
    startGame(roomCode);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Lobby Code at top */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Lobby Code</h1>
        <div className="text-4xl font-bold font-mono text-blue-600 bg-white px-6 py-3 rounded-lg shadow-md inline-block">
          {roomCode}
        </div>
        <div className="mt-2 text-sm subtitle-black">
          {isConnected ? (
            <span className="text-green-600">✓ Connected</span>
          ) : (
            <span className="text-red-600">✗ Connecting...</span>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-6xl mx-auto">
        <div className="flex">
          {/* Player list */}
          <div className="w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Players</h2>
              <ul className="space-y-3">
                {players.map((player, index) => (
                  <li key={player.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 font-medium">{player.nickname}</span>
                  </li>
                ))}
                {players.length === 0 && (
                  <li className="text-gray-500 italic text-center py-4">
                    Waiting for players to join...
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Me reserving space for later stuffs we havent made */}
          <div className="flex-1 ml-6">
            {/* Start Game Section */}
            <div className="bg-white rounded-lg shadow-md p-8 h-full flex flex-col items-center justify-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Ready to Start?
              </h3>
              <button 
                onClick={handleStartGame}
                disabled={players.length < 2 || !isConnected}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg"
              >
                {players.length < 2 ? `Need ${2 - players.length} more players` : 'Start Game'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Lobby() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="subtitle-black">Loading lobby...</div>
      </div>}>
      <LobbyContent />
    </Suspense>
  );
}