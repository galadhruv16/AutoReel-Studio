'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Aperture, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/studio';
  // Prevent open redirect: must be a local relative path and not protocol-relative (//)
  const redirectPath = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/studio';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid credentials. Access denied.');
        setIsLoading(false);
        return;
      }

      // Successful login -> Redirect
      router.push(redirectPath);
      router.refresh();
    } catch {
      setErrorMessage('Network connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-[#232736] bg-[#0E1017] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Subtle Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#FF4F00] to-transparent" />

      {/* Eyebrow Status Badge */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2B3040] bg-[#12141C] px-3.5 py-1 text-[11px] font-mono font-bold text-[#F59E0B]">
          <Lock className="h-3 w-3 text-[#F59E0B]" />
          <span>RESTRICTED INSIDER GATE</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Authorized Access Only
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          AutoReel Studio is an invite-only engine. Enter your authorized administrator credentials to proceed.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 p-3.5 text-xs text-[#FCA5A5] animate-shake">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#EF4444] mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
            Administrator Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="authorized@autoreel.studio"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-[#232736] bg-[#12141C] px-4 py-3 text-sm text-white placeholder-[#525B75] transition focus:border-[#FF4F00] focus:outline-none focus:ring-1 focus:ring-[#FF4F00]"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
            Insider Passkey
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#232736] bg-[#12141C] px-4 py-3 text-sm text-white placeholder-[#525B75] transition focus:border-[#FF4F00] focus:outline-none focus:ring-1 focus:ring-[#FF4F00] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525B75] hover:text-[#94A3B8] transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#FF4F00] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF4F00]/25 transition hover:bg-[#FF3B00] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Enter Studio</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Security Note */}
      <div className="mt-8 pt-6 border-t border-[#1C202E] flex items-center justify-center gap-2 text-[11px] font-mono text-[#64748B]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
        <span>End-to-End Cryptographically Signed Sessions</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#08090A] text-[#EDEDED] flex flex-col justify-between selection:bg-[#FF4F00] selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-[#FF4F00]/10 blur-[130px]" />
      </div>

      {/* Top Header */}
      <header className="w-full border-b border-[#1A1C24] bg-[#08090A]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF4F00] text-white shadow-lg shadow-[#FF4F00]/25 transition group-hover:scale-105">
              <Aperture className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              AutoReel <span className="text-[#94A3B8] font-medium">Studio</span>
            </span>
          </a>

          <a
            href="/"
            className="text-xs font-mono text-[#94A3B8] hover:text-white transition flex items-center gap-1.5"
          >
            ← Back to Showcase
          </a>
        </div>
      </header>

      {/* Center Auth Card wrapped in Suspense */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-3xl border border-[#232736] bg-[#0E1017] p-10 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF4F00] border-t-transparent mx-auto" />
              <p className="mt-4 text-xs font-mono text-[#94A3B8]">Loading Authentication Gate...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#151720] text-center text-xs text-[#64748B]">
        <span>AutoReel Studio • 100% Deterministic Video Engine</span>
      </footer>
    </div>
  );
}
