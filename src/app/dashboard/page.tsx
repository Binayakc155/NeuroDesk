'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  useDashboardStats,
  useFocusSession,
  formatTime,
  useWhitelistedDomains,
  useDistractionDetection,
} from '@/lib/hooks';
import SoundPlayer from '@/components/SoundPlayer';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { stats, loading } = useDashboardStats();
  const {
    activeSession,
    elapsedTime,
    distractionCount,
    loading: sessionLoading,
    startSession,
    endSession,
    recordDistraction,
  } = useFocusSession();
  const { domains: whitelistedDomains } = useWhitelistedDomains();
  const [isStarting, setIsStarting] = useState(false);

  useDistractionDetection(
    !!activeSession,
    () => recordDistraction(),
    whitelistedDomains
  );

  const handleStartSession = async () => {
    setIsStarting(true);
    await startSession();
    setIsStarting(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2B1742]">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-[#2B1742] text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-white hover:text-violet-400 transition"
          >
            NeuroDesk
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/settings"
              className="text-sm text-slate-300 hover:text-violet-400 transition"
            >
              Settings
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-slate-300 hover:text-rose-400 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Focus Card */}
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-10 mb-12 shadow-xl backdrop-blur-md">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-semibold mb-8">
              Track Your Focus
            </h1>

            {activeSession ? (
              <div className="mb-10">
                <div className="text-6xl font-mono font-bold text-violet-400 mb-4 drop-shadow-lg">
                  {formatTime(elapsedTime)}
                </div>

                <p className="text-slate-400 text-sm">
                  Session in progress
                </p>

                {distractionCount > 0 && (
                  <p className="text-rose-400 text-sm mt-3 font-medium">
                    {distractionCount} distraction
                    {distractionCount !== 1 ? 's' : ''} detected
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-400 mb-10">
                Auto tracking enabled • Tab switches over 3 seconds count as distractions
              </p>
            )}

            <div className="flex justify-center gap-6">
              {activeSession ? (
                <button
                  onClick={endSession}
                  disabled={sessionLoading}
                  className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition shadow-lg shadow-rose-500/20 disabled:opacity-50"
                >
                  {sessionLoading ? 'Saving...' : 'End Session'}
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  disabled={isStarting || sessionLoading}
                  className="px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-xl transition shadow-lg shadow-violet-500/30 disabled:opacity-50"
                >
                  {isStarting ? 'Starting...' : 'Start Session'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col items-center">
            <p className="text-4xl font-bold text-white">
              {loading ? '-' : stats.totalSessions}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Total Sessions
            </p>
          </div>

          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col items-center">
            <p className="text-4xl font-bold text-emerald-400">
              {loading ? '-' : stats.totalHours}h
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Focus Hours
            </p>
          </div>

          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col items-center">
            <p className="text-4xl font-bold text-indigo-400">
              {loading ? '-' : stats.focusScore}%
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Focus Score
            </p>
          </div>
        </div>

        {/* Sound Player Section */}
        {activeSession && (
          <div className="mt-12">
            <SoundPlayer isPlaying={!!activeSession} />
          </div>
        )}
      </main>
    </div>
  );
}