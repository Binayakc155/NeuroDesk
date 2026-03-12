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
import Chatbot from '@/components/Chatbot';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { stats, loading, refetch } = useDashboardStats();
  const {
    activeSession,
    elapsedTime,
    distractionCount,
    loading: sessionLoading,
    startSession,
    endSession,
    recordDistraction,
  } = useFocusSession(refetch);
  const { domains: whitelistedDomains } = useWhitelistedDomains();
  const [isStarting, setIsStarting] = useState(false);
  const [showSessions, setShowSessions] = useState(true);

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

  const groupSessionsByDay = (sessions: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.startTime);
      const dateKey = date.toLocaleDateString('en-GB', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });
    
    return grouped;
  };



  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1117]">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="relative min-h-screen bg-[#0e1117] text-slate-100 overflow-hidden">

      {/* Subtle Ambient Glow */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-black/30 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-white hover:text-blue-400 transition"
          >
            NeuroDesk
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/settings"
              className="text-sm text-slate-400 hover:text-blue-400 transition"
            >
              Settings
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-slate-400 hover:text-rose-400 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10">

        {/* Focus Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mb-12 shadow-2xl shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10">

          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-semibold mb-8 text-white">
              Track Your Focus
            </h1>

            {activeSession ? (
              <div className="mb-10">
                <div className="text-6xl font-mono font-bold text-blue-400 mb-4">
                  {formatTime(elapsedTime)}
                </div>

                <p className="text-slate-400 text-sm">
                  Session in progress
                </p>

                <p className="text-rose-400 text-sm mt-2">
                  Distractions: {distractionCount}
                </p>
              </div>
            ) : (
              <p className="text-slate-400 mb-10">
                Ready to start your focus session?
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
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isStarting ? 'Starting...' : 'Start Session'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-blue-500/10">
            <p className="text-4xl font-bold text-white">
              {loading ? '-' : stats.totalSessions}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Total Sessions
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-emerald-500/10">
            <p className="text-4xl font-bold text-emerald-400">
              {loading ? '-' : stats.totalHours}h
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Focus Hours
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-indigo-500/10">
            <p className="text-4xl font-bold text-indigo-400">
              {loading ? '-' : stats.focusScore}%
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Focus Score
            </p>
          </div>

        </div>

        {/* Spotify Player */}
        <div className="mt-12">
          <SoundPlayer isPlaying={!!activeSession} />
        </div>

        {/* Day-wise Sessions */}
        {stats.recentSessions && stats.recentSessions.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-white">Focus Sessions</h2>
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium text-slate-300 transition"
              >
                {showSessions ? '▼ Hide' : '▶ Show'}
              </button>
            </div>
            {showSessions && (
              <div className="space-y-8">
                {Object.entries(groupSessionsByDay(stats.recentSessions)).map(([date, daySessions]: [string, any[]]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{date}</h3>
                    <div className="space-y-2">
                      {daySessions.map((session) => (
                        <div
                          key={session.id}
                          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col flex-1">
                              <p className="text-sm text-slate-200 font-medium">
                                {new Date(session.startTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })} - {session.endTime ? new Date(session.endTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                }) : 'In Progress'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">{formatTime(session.duration)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 text-sm font-semibold">{Math.round((session.duration / 3600) * 10) / 10}h</p>
                            <p className="text-xs text-slate-500">focus</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Chatbot Widget */}
      <Chatbot />
    </div>
  );
}
