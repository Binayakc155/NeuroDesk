'use client';

export const dynamic = 'force-dynamic';

import { useUser, useClerk, useAuth } from '@clerk/nextjs';
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

interface FocusSession {
  id: string;
  userId: string;
  teamId?: string;
  startTime: Date | string;
  endTime?: Date | string;
  duration: number;
  isDistracted: boolean;
  distractionCount: number;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
export default function Dashboard() {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const { stats = { recentSessions: [], totalSessions: 0, totalHours: 0, focusScore: 0 }, loading, refetch } = useDashboardStats();
  const {
    activeSession,
    elapsedTime = 0,
    distractionCount = 0,
    loading: sessionLoading,
    startSession,
    endSession,
    recordDistraction,
  } = useFocusSession(refetch);
  const { domains: whitelistedDomains = [] } = useWhitelistedDomains();
  const [isStarting, setIsStarting] = useState(false);
  const [showSessions, setShowSessions] = useState(true);

  const firstName =
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'Friend';

  const todayKey = new Date().toDateString();
  const recentSessions: FocusSession[] = Array.isArray(stats?.recentSessions) ? stats.recentSessions : [];
  const todaySessions = recentSessions.filter(
    (session: FocusSession) => session?.startTime && new Date(session.startTime).toDateString() === todayKey
  );
  const todayFocusMinutes = Math.round(
    todaySessions.reduce((acc: number, session: FocusSession) => acc + (session?.duration || 0), 0) / 60
  );
  const weeklyGoalMinutes = 600;
  const weeklyProgressPercent = Math.min(
    Math.round(((stats?.totalHours || 0) * 60 / weeklyGoalMinutes) * 100),
    100
  );

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

  const groupSessionsByDay = (sessions: FocusSession[]) => {
    const grouped: { [key: string]: FocusSession[] } = {};

    sessions.forEach(session => {
      if (!session?.startTime) return;
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/auth/signin');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1117]">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1117]">
        <p className="text-slate-400">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell relative min-h-screen overflow-hidden pt-20 text-slate-100 md:pt-24">

      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#7bd4ff]/20 bg-[#04101f]/72 shadow-[0_10px_40px_rgba(4,10,20,0.55)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6">

          {/* LEFT SIDE (Logo / Title) */}
          <div className="text-xl font-semibold text-white cursor-pointer">
            NeuroDesk
          </div>

          {/* RIGHT SIDE (Actions) */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/settings"
              className="text-sm font-medium text-slate-300 transition hover:text-[#a8efff]"
            >
              Settings
            </Link>

            <button
              onClick={handleSignOut}
              className="rounded-full border border-[#6ab5dc]/30 bg-[#0a1a2e]/65 px-3 py-1.5 text-sm font-medium text-[#d3f3ff] transition hover:border-[#8de1ff]/60 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/6 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Personal focus cockpit
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Welcome  {firstName}
              </h1>
              <p className="mt-2 text-slate-300">
                Build calm momentum today. Small deep-work blocks add up fast.
              </p>
            </div>
            <div className="rounded-2xl border border-[#65c8e7]/30 bg-[#0a1d30]/80 px-4 py-3 text-sm text-[#d7f5ff] shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
              <p className="font-semibold">Today: {todayFocusMinutes} minutes focused</p>
              <p className="opacity-80">{todaySessions.length} sessions recorded</p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-[#0b1020]/70 p-7 shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Focus session
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Deep Work Timer</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
                {activeSession ? 'Live now' : 'Ready'}
              </span>
            </div>

            {activeSession ? (
              <div className="mb-8">
                <div className="mb-2 text-5xl font-semibold text-[#dbe2ff] sm:text-6xl">
                  {formatTime(elapsedTime)}
                </div>

                <p className="text-sm text-slate-300">
                  You are in the zone. Keep this tab active for your best score.
                </p>

                <p className="mt-2 text-sm font-medium text-rose-300">
                  Distractions noticed: {distractionCount}
                </p>
              </div>
            ) : (
              <p className="mb-8 text-slate-300">
                Start a new session and let the app track your focus quality automatically.
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              {activeSession ? (
                <button
                  onClick={endSession}
                  disabled={sessionLoading}
                  className="rounded-xl bg-linear-to-r from-rose-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:from-rose-400 hover:to-pink-400 disabled:opacity-50"
                >
                  {sessionLoading ? 'Saving...' : 'End Session'}
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  disabled={isStarting || sessionLoading}
                  className="rounded-xl bg-linear-to-r from-[#14b8a6] to-[#3b82f6] px-6 py-3 font-semibold text-white shadow-[0_8px_26px_rgba(20,184,166,0.3)] transition hover:from-[#2dd4bf] hover:to-[#60a5fa] disabled:opacity-50"
                >
                  {isStarting ? 'Starting...' : 'Start Session'}
                </button>
              )}
              <Link
                href="/settings"
                className="rounded-xl border border-white/12 bg-white/6 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Tune Preferences
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-linear-to-br from-[#0b1d35]/90 via-[#112948]/86 to-[#0f2e3f]/88 p-7 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Weekly target
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">10 hours focus goal</h3>
            <p className="mt-2 text-sm text-slate-300">
              Keep your momentum with consistent short sessions.
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-300">
                <span>Progress</span>
                <span>{weeklyProgressPercent}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#2dd4bf] to-[#60a5fa] transition-all"
                  style={{ width: `${weeklyProgressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {loading ? '...' : `${stats?.totalHours || 0}h completed this week`}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-[0_14px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">Total sessions</p>
            <p className="mt-2 text-3xl font-semibold text-white">{loading ? '-' : (stats?.totalSessions || 0)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-[0_14px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">Focus hours</p>
            <p className="mt-2 text-3xl font-semibold text-[#8ff3ec]">{loading ? '-' : `${stats?.totalHours || 0}h`}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-[0_14px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">Focus score</p>
            <p className="mt-2 text-3xl font-semibold text-[#93c5fd]">{loading ? '-' : `${stats?.focusScore || 0}%`}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-[0_14px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <p className="text-sm text-slate-400">Distraction guard</p>
            <p className="mt-2 text-3xl font-semibold text-rose-300">{activeSession ? distractionCount : 0}</p>
            <p className="mt-1 text-xs text-slate-500">Current session events</p>
          </div>
        </section>

        {recentSessions.length > 0 && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-[#08101f]/70 p-6 shadow-[0_18px_46px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Session Journal</h2>
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="rounded-lg border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                {showSessions ? 'Hide list' : 'Show list'}
              </button>
            </div>
            {showSessions && (
              <div className="space-y-7">
                {Object.entries(groupSessionsByDay(recentSessions)).map(([date, daySessions]: [string, FocusSession[]]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{date}</h3>
                    <div className="space-y-2">
                      {daySessions.map((session) => (
                        <div
                          key={session?.id ?? `${date}-${Math.random()}`}
                          className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:bg-white/8"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col flex-1">
                              <p className="text-sm font-semibold text-slate-100">
                                {new Date(session?.startTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })} - {session?.endTime ? new Date(session.endTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                }) : 'In Progress'}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">{formatTime(session?.duration || 0)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#7de9ff]">{Math.round(((session?.duration || 0) / 3600) * 10) / 10}h</p>
                            <p className="text-xs text-slate-500">focus</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="mt-12">
          <SoundPlayer isPlaying={!!activeSession} />
        </section>

      </main>

      <Chatbot />
    </div>
  );
}
