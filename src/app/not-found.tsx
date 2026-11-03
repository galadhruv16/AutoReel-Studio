import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090A] text-[#EDEDED] px-4 text-center">
      <h1 className="text-6xl font-black text-[#FF4F00] font-mono mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-gray-400 max-w-md mb-8">
        The requested resource or page could not be located.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-lg bg-[#FF4F00] hover:bg-[#FF6A22] text-white font-medium transition"
      >
        Return to Home
      </Link>
    </div>
  );
}
