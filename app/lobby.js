'use client';

import { useState } from 'react';

export default function Lobby() {
  // Sample lobby code  (we dont have multiplayer or online yet LMAO LOLZ somnaky)
  const lobbyCode = "ABC123";
  
  // Static player names, because currently we don't have multiplayer lolz
  const [players, setPlayers] = useState([
    "Player 1",
    "Player 2", 
    "Player 3"
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Lobby Code at top */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Lobby Code</h1>
        <div className="text-4xl font-bold font-mono text-blue-600 bg-white px-6 py-3 rounded-lg shadow-md inline-block">
          {lobbyCode}
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
                  <li key={index} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 font-medium">{player}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Me reserving space for later stuffs we havent made */}
          <div className="flex-1 ml-6">
            {/* This area is reserved for future stuffies */}
          </div>
        </div>
      </div>
    </div>
  );
}