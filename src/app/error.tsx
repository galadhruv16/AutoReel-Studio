'use client';

import React from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090A] text-[#EDEDED] px-4 text-center">
      <h1 className="text-5xl font-black text-[#FF4F00] font-mono mb-4">Error</h1>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-gray-400 max-w-md mb-8">
        {error.message || 'An unexpected error occurred while rendering this page.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-lg bg-[#FF4F00] hover:bg-[#FF6A22] text-white font-medium transition"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-lg border border-[#232634] hover:bg-[#14161F] text-gray-300 font-medium transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
