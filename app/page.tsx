'use client';

import { useState } from "react";

export default function Home() {
  const [joinCode, setJoinCode] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight">
              🎵 <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">Valiant</span> Voices
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-light">
              Write songs, pass lyrics, create musical masterpieces together!
            </p>
          </div>

          {/* Game Description */}
          <div className="mb-12 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6 text-blue-100">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl mb-3">✏️</div>
                  <h3 className="font-semibold mb-2">Write</h3>
                  <p className="text-sm">Start with a song prompt or continue someone else's lyrics</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center text-2xl mb-3">🎤</div>
                  <h3 className="font-semibold mb-2">Pass</h3>
                  <p className="text-sm">Your lyrics get passed to the next player in the chain</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center text-2xl mb-3">🎶</div>
                  <h3 className="font-semibold mb-2">Reveal</h3>
                  <p className="text-sm">See the hilarious and creative songs everyone created together</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-6">
            {/* Create Room Button */}
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-2xl transform hover:scale-105 transition-all duration-200 min-w-64">
              🎤 Create New Room
            </button>

            {/* Join Room Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
              <p className="text-white mb-4 font-medium">Join an existing room:</p>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-center font-mono text-lg"
                  maxLength={6}
                />
                <button
                  disabled={!joinCode}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    joinCode 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="text-white font-semibold">2-8 Players</h3>
              <p className="text-blue-200 text-sm">Perfect for small groups</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-white font-semibold">Real-time</h3>
              <p className="text-blue-200 text-sm">Live collaboration</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="text-white font-semibold">Creative</h3>
              <p className="text-blue-200 text-sm">Endless possibilities</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">😂</div>
              <h3 className="text-white font-semibold">Fun</h3>
              <p className="text-blue-200 text-sm">Hilarious results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <p className="text-white/60 text-sm">
          Made with 💜 for music lovers and creative minds
        </p>
      </div>
    </div>
  );
}