import React from 'react';
import './globals.css';

export const metadata = {
  title: 'AutoReel Studio — Programmatic Short-Form Motion Graphics',
  description: 'Compile technical scripts and ideas into studio-grade vertical explainer reels with millisecond audio sync and spatial vector animations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#08090A] text-[#EDEDED] antialiased selection:bg-[#FF4F00] selection:text-white">
        {children}
      </body>
    </html>
  );
}
