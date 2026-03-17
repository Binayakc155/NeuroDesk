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

  const firstName =
    session?.user?.name?.split(' ')[0] ||
    session?.user?.email?.split('@')[0] ||
    'Friend';

  const todayKey = new Date().toDateString();
  const todaySessions = stats.recentSessions.filter(
    (session: any) => new Date(session.startTime).toDateString() === todayKey
  );
  const todayFocusMinutes = Math.round(
    todaySessions.reduce((acc: number, session: any) => acc + (session.duration || 0), 0) / 60
  );
  const weeklyGoalMinutes = 600;
  const weeklyProgressPercent = Math.min(
    Math.round(((stats.totalHours * 60) / weeklyGoalMinutes) * 100),
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
    <div className="dashboard-shell relative min-h-screen overflow-hidden text-[#1f2a24]">
      <div className="float-orb pointer-events-none absolute -top-24 left-[6%] h-104 w-104 rounded-full bg-[#ffd584]/35 blur-3xl" />
      <div className="float-orb-delay pointer-events-none absolute top-36 right-[4%] h-96 w-96 rounded-full bg-[#8cd9bc]/28 blur-3xl" />
      <div className="float-orb-soft pointer-events-none absolute bottom-12 left-[32%] h-72 w-72 rounded-full bg-[#9fd2ff]/18 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/45 to-transparent" />

      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f7f5ef]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#1e2c24] transition hover:text-[#0f7a5d] sm:text-xl"
          >
            FocusBloom
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/settings"
              className="text-sm font-medium text-[#425248] transition hover:text-[#0f7a5d]"
            >
              Settings
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-[#425248] transition hover:border-[#e87c6f] hover:text-[#b34f45]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <section className="mb-8 rounded-3xl border border-[#e6e2d6] bg-white/80 p-6 shadow-[0_10px_30px_rgba(62,70,64,0.08)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d6d62]">
            Personal focus cockpit
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-[#1a2a22] sm:text-4xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 text-[#4c5a50]">
                Build calm momentum today. Small deep-work blocks add up fast.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d8e6df] bg-[#ecf9f2] px-4 py-3 text-sm text-[#1f5f49]">
              <p className="font-semibold">Today: {todayFocusMinutes} minutes focused</p>
              <p className="opacity-80">{todaySessions.length} sessions recorded</p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-3xl border border-[#e6e2d6] bg-white p-7 shadow-[0_12px_32px_rgba(62,70,64,0.1)] sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#647368]">
                  Focus session
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#1a2a22]">Deep Work Timer</h2>
              </div>
              <span className="rounded-full bg-[#f4f2ea] px-3 py-1 text-xs font-medium text-[#5a655f]">
                {activeSession ? 'Live now' : 'Ready'}
              </span>
            </div>

            {activeSession ? (
              <div className="mb-8">
                <div className="mb-2 text-5xl font-semibold text-[#0f7a5d] sm:text-6xl">
                  {formatTime(elapsedTime)}
                </div>

                <p className="text-sm text-[#4f5f55]">
                  You are in the zone. Keep this tab active for your best score.
                </p>

                <p className="mt-2 text-sm font-medium text-[#b8554c]">
                  Distractions noticed: {distractionCount}
                </p>
              </div>
            ) : (
              <p className="mb-8 text-[#4f5f55]">
                Start a new session and let the app track your focus quality automatically.
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              {activeSession ? (
                <button
                  onClick={endSession}
                  disabled={sessionLoading}
                  className="rounded-xl bg-[#d96456] px-6 py-3 font-semibold text-white transition hover:bg-[#c35347] disabled:opacity-50"
                >
                  {sessionLoading ? 'Saving...' : 'End Session'}
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  disabled={isStarting || sessionLoading}
                  className="rounded-xl bg-[#0f7a5d] px-6 py-3 font-semibold text-white transition hover:bg-[#0b644c] disabled:opacity-50"
                >
                  {isStarting ? 'Starting...' : 'Start Session'}
                </button>
              )}
              <Link
                href="/settings"
                className="rounded-xl border border-[#d9d5c8] bg-[#f7f3e8] px-6 py-3 font-semibold text-[#3f5147] transition hover:bg-[#f1ecde]"
              >
                Tune Preferences
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8e6df] bg-linear-to-br from-[#f3fbf8] to-[#e8f4ff] p-7 shadow-[0_12px_32px_rgba(62,70,64,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#607a6c]">
              Weekly target
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[#1a2a22]">10 hours focus goal</h3>
            <p className="mt-2 text-sm text-[#4f6156]">
              Keep your momentum with consistent short sessions.
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-[#3d574b]">
                <span>Progress</span>
                <span>{weeklyProgressPercent}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#0f7a5d] to-[#2fa17e] transition-all"
                  style={{ width: `${weeklyProgressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[#5d7268]">
                {loading ? '...' : `${stats.totalHours}h completed this week`}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#e6e2d6] bg-white p-5 shadow-[0_8px_22px_rgba(62,70,64,0.08)]">
            <p className="text-sm text-[#68766d]">Total sessions</p>
            <p className="mt-2 text-3xl font-semibold text-[#1e2b24]">{loading ? '-' : stats.totalSessions}</p>
          </div>

          <div className="rounded-2xl border border-[#e6e2d6] bg-white p-5 shadow-[0_8px_22px_rgba(62,70,64,0.08)]">
            <p className="text-sm text-[#68766d]">Focus hours</p>
            <p className="mt-2 text-3xl font-semibold text-[#0f7a5d]">{loading ? '-' : `${stats.totalHours}h`}</p>
          </div>

          <div className="rounded-2xl border border-[#e6e2d6] bg-white p-5 shadow-[0_8px_22px_rgba(62,70,64,0.08)]">
            <p className="text-sm text-[#68766d]">Focus score</p>
            <p className="mt-2 text-3xl font-semibold text-[#2f65a9]">{loading ? '-' : `${stats.focusScore}%`}</p>
          </div>

          <div className="rounded-2xl border border-[#e6e2d6] bg-white p-5 shadow-[0_8px_22px_rgba(62,70,64,0.08)]">
            <p className="text-sm text-[#68766d]">Distraction guard</p>
            <p className="mt-2 text-3xl font-semibold text-[#b8554c]">{activeSession ? distractionCount : 0}</p>
            <p className="mt-1 text-xs text-[#839188]">Current session events</p>
          </div>
        </section>

        {stats.recentSessions && stats.recentSessions.length > 0 && (
          <section className="mt-12 rounded-3xl border border-[#e6e2d6] bg-white p-6 shadow-[0_10px_28px_rgba(62,70,64,0.08)] sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#1a2a22]">Session Journal</h2>
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="rounded-lg border border-[#d8d4c8] bg-[#f7f3e8] px-4 py-2 text-sm font-medium text-[#44564d] transition hover:bg-[#eee8d9]"
              >
                {showSessions ? 'Hide list' : 'Show list'}
              </button>
            </div>
            {showSessions && (
              <div className="space-y-7">
                {Object.entries(groupSessionsByDay(stats.recentSessions)).map(([date, daySessions]: [string, any[]]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#647368]">{date}</h3>
                    <div className="space-y-2">
                      {daySessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between rounded-2xl border border-[#ece8dc] bg-[#fefcf7] p-4 transition hover:bg-[#faf6ed]"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col flex-1">
                              <p className="text-sm font-semibold text-[#2f3f36]">
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
                              <p className="mt-1 text-xs text-[#738179]">{formatTime(session.duration)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#0f7a5d]">{Math.round((session.duration / 3600) * 10) / 10}h</p>
                            <p className="text-xs text-[#738179]">focus</p>
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

        <div className="mt-12">
          <SoundPlayer isPlaying={!!activeSession} />
        </div>
      </main>

      <Chatbot />
    </div>
  );
}
