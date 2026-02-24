'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboardStats, useFocusSession, formatTime, useWhitelistedDomains, useDistractionDetection } from '@/lib/hooks';
import SoundPlayer from '@/components/SoundPlayer';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { stats, loading } = useDashboardStats();
  const { activeSession, elapsedTime, distractionCount, loading: sessionLoading, startSession, endSession, recordDistraction } = useFocusSession();
  const { domains: whitelistedDomains } = useWhitelistedDomains();
  const [isStarting, setIsStarting] = useState(false);

  // Automatic distraction detection
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-black to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            NeuroDesk
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Focus Session Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-10">Start Tracking Your Focus</h1>
            
            {/* Timer Display */}
            {activeSession ? (
              <div className="mb-10">
                <div className="text-7xl font-mono font-bold bg-linear-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent mb-6 tracking-tight">
                  {formatTime(elapsedTime)}
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-blue-700 font-medium text-sm">Session in progress</p>
                </div>
                {distractionCount > 0 && (
                  <p className="text-orange-600 text-sm mt-4 font-medium">
                    {distractionCount} distraction{distractionCount !== 1 ? 's' : ''} detected
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-linear-to-r from-blue-50 to-emerald-50 rounded-full border border-blue-100">
                  <p className="text-gray-700 text-sm font-medium">
                    Auto-tracking enabled • Tab switches &gt;3s count as distractions
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex gap-4 justify-center">
              {activeSession ? (
                <button
                  onClick={endSession}
                  disabled={sessionLoading}
                  className="px-10 py-4 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
                >
                  {sessionLoading ? 'Saving...' : 'End Session'}
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  disabled={isStarting || sessionLoading}
                  className="px-10 py-4 bg-linear-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
                >
                  {isStarting ? 'Starting...' : 'Start Session'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sound Player */}
        {activeSession && (
          <div className="mb-8">
            <SoundPlayer isPlaying={!!activeSession} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-linear-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
            <p className="text-5xl font-black bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{loading ? '-' : stats.totalSessions}</p>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Sessions</p>
          </div>

          <div className="group bg-linear-to-br from-white to-emerald-50 rounded-2xl shadow-lg border border-emerald-100 p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
            <p className="text-5xl font-black bg-linear-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">{loading ? '-' : stats.totalHours}h</p>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Focus Hours</p>
          </div>

          <div className="group bg-linear-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
            <p className="text-5xl font-black bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">{loading ? '-' : stats.focusScore}%</p>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Focus Score</p>
          </div>
        </div>
      </main>
    </div>
  );
}
