'use client';

import React, { useState, useEffect } from 'react';
import { Aperture, LogOut, Check } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { useRouter } from 'next/navigation';

export const StudioNavbar: React.FC = () => {
  const { project, setStage } = useStudio();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('Insider Admin');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.email) {
          setUserEmail(data.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    router.push('/login');
  };

  const steps = [
    { number: 1 as const, label: 'Topic & Concept' },
    { number: 2 as const, label: 'Storyboard' },
    { number: 3 as const, label: 'Video Review' },
    { number: 4 as const, label: 'Publish & Export' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232634] bg-[#08090A]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <a href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF4F00] text-white shadow-md shadow-[#FF4F00]/25 transition group-hover:bg-[#FF3B00]">
              <Aperture className="h-5 w-5" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">
              AutoReel <span className="text-[#94A3B8] font-medium">Studio</span>
            </span>
          </a>
        </div>

        {/* Stepper (Desktop) */}
        <nav className="hidden lg:flex items-center gap-2">
          {steps.map((s, idx) => {
            const isActive = project.stage === s.number;
            const isCompleted = project.stage > s.number;
            const isAccessible = s.number <= project.stage || (s.number === 2 && project.topic.trim().length >= 5);

            return (
              <React.Fragment key={s.number}>
                <button
                  type="button"
                  onClick={() => {
                    if (isAccessible) setStage(s.number);
                  }}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#FF4F00]/15 text-white border border-[#FF4F00]/40 shadow-sm shadow-[#FF4F00]/20'
                      : isCompleted
                      ? 'text-[#94A3B8] hover:text-white cursor-pointer'
                      : 'text-[#64748B] cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                      isActive
                        ? 'bg-[#FF4F00] text-white'
                        : isCompleted
                        ? 'bg-[#1C1E26] text-[#10B981] border border-[#232634]'
                        : 'bg-[#14161F] text-[#64748B] border border-[#232634]'
                    }`}
                  >
                    {isCompleted ? <Check className="h-3 w-3 stroke-[2.5]" /> : s.number}
                  </span>
                  <span>{s.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-[1px] w-6 transition ${
                      project.stage > s.number ? 'bg-[#FF4F00]/50' : 'bg-[#232634]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* User Pill & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#232634] bg-[#14161F] px-3 py-1 text-xs text-[#EDEDED]">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="font-mono text-[11px] text-[#94A3B8] truncate max-w-[140px]" title={userEmail}>
              {userEmail}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out of insider session"
            className="flex items-center gap-1.5 rounded-lg border border-[#232634] bg-[#14161F] px-2.5 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-white hover:bg-[#1C1E26] transition active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5 text-[#FF4F00]" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Step Indicator Bar */}
      <div className="flex lg:hidden items-center justify-between border-t border-[#232634] bg-[#0F1015] px-4 py-2">
        <span className="text-xs font-mono font-medium text-[#FF4F00]">
          Stage {project.stage} / 4: {steps[project.stage - 1].label}
        </span>
        <div className="flex items-center gap-1.5">
          {steps.map((s) => (
            <div
              key={s.number}
              className={`h-1.5 rounded-full transition-all ${
                s.number === project.stage
                  ? 'w-6 bg-[#FF4F00]'
                  : s.number < project.stage
                  ? 'w-3 bg-[#10B981]'
                  : 'w-3 bg-[#232634]'
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
};
