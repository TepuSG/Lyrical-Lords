"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Instructions() {
  const router = useRouter();

  const goBack = (e) => {
    e?.preventDefault();
    // Prefer using the browser history (returns to the actual previous page)
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    // Otherwise fall back to the saved path saved by RouteTracker
    try {
      const last = sessionStorage.getItem('lastNonInstructionsPath');
      if (last) {
        router.push(last);
        return;
      }
    } catch (err) {
      // ignore
    }

    // Final fallback
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Main Title */}
      <div className="text-center mb-8">
        <img src="/LyricalLordsDark.png" alt="Lyrical Lords logo" className="mx-auto mb-4 w-36 h-auto" />
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Lyrical Lords
        </h1>
        <p className="text-lg text-gray-600">
          Join the musical storytelling adventure
        </p>
      </div>

      {/* Join Room Box */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          How To Play
        </h2>

        <div className="space-y-4 text-gray-700">
          <p>1. Create or join a room with your friends.</p>
          <p>2. Each player submits an original song title.</p>
          <p>3. Players take turns writing lyrics based on the submitted titles.</p>
          <p className="mt-4 font-semibold text-center">
            Buckle your bootstraps and get ready to become a Lyrical Lord!
          </p>
        </div>
          
        <button
          type="button"
          onClick={goBack}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
        >
          Back
        </button>
      </div>
    </div>
  );
}