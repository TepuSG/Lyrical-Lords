
'use client';
import React from 'react'; 

export default function Nickname({ searchParams }) {
  const room = searchParams?.room || '';

  return (
    <div>
        <h1>Enter your Nickname</h1>
        <input type="text" placeholder="Nickname" className="border p-2 rounded"/>
        <button href={`/${room ? `chat?room=${room}` : 'chat'}`} className="ml-2 p-2 bg-blue-500 text-white rounded">
            Join Chat
        </button>
    </div>
  );
}