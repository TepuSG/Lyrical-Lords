'use client';

import { useSearchParams } from 'next/navigation';

export default function SongPrompt() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';

  return (
    <div>
      <h1>Room: {roomCode}</h1>
      <h2>Enter your Original Song Title!</h2>
      <input type="text" placeholder="Song Title" className="border p-2 rounded" />
      <button href="#" className="mt-4 bg-blue-500 text-white p-2 rounded">Submit Song Title</button>
    </div>
  );
}
