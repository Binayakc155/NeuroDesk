'use client';

import { useEffect, useRef, useState } from 'react';

type FocusSessionStatus = 'active' | 'paused' | 'completed';

interface ActiveFocusSession {
  id: string;
  startTime: string;
  status: FocusSessionStatus;
  pausedAt: string | null;
  pausedDuration: number;
  distractionCount: number;
}

function calculateElapsedTime(
  session: ActiveFocusSession,
  referenceNow: number = Date.now()
) {
  const serverStartTime = new Date(session.startTime).getTime();
  const currentPauseDuration = session.pausedAt
    ? Math.floor((referenceNow - new Date(session.pausedAt).getTime()) / 1000)
    : 0;

  return Math.max(
    0,
    Math.floor((referenceNow - serverStartTime) / 1000) -
      (session.pausedDuration || 0) -
      currentPauseDuration
  );
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    focusScore: 0,
    recentSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expose fetchStats so it can be called from outside
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Return refetch method
  return { stats, loading, error, refetch: fetchStats };
}

export function useFocusSession(refetchStats?: () => void) {
  const [activeSession, setActiveSession] = useState<ActiveFocusSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);

  // Fetch active session on mount
  useEffect(() => {
    fetchActiveSession();
  }, []);

  // Timer for elapsed time
  useEffect(() => {
    if (!activeSession) return;

    setElapsedTime(calculateElapsedTime(activeSession));
    if (activeSession.status === 'paused') return;

    const interval = setInterval(() => {
      setElapsedTime(calculateElapsedTime(activeSession));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchActiveSession = async () => {
    try {
      const response = await fetch('/api/focus-sessions/active');
      if (response.ok) {
        const data = await response.json();
        setActiveSession(data.activeSession);
        if (data.activeSession) {
          const now = Date.now();
          setElapsedTime(calculateElapsedTime(data.activeSession, now));
          setDistractionCount(data.activeSession.distractionCount || 0);
        } else {
          setElapsedTime(0);
          setDistractionCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const recordDistraction = async (description?: string) => {
    if (!activeSession || activeSession.status !== 'active') return;

    try {
      const response = await fetch('/api/distractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focusSessionId: activeSession.id,
          description: description || 'Tab switch detected',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDistractionCount(data.totalDistractions);
        // Refetch dashboard stats after distraction
        if (refetchStats) refetchStats();
      }
    } catch (error) {
      console.error('Error recording distraction:', error);
    }
  };

  const startSession = async () => {
    setLoading(true);
    try {
      setElapsedTime(0);

      const response = await fetch('/api/focus-sessions/active', {
        method: 'POST',
      });
      if (response.ok) {
        const session = await response.json();
        setActiveSession(session);
        setElapsedTime(0);
        setDistractionCount(session?.distractionCount || 0);
        if (refetchStats) {
          refetchStats();
        }
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/focus-sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime: new Date(),
          duration: elapsedTime,
        }),
      });
      if (response.ok) {
        setActiveSession(null);
        setElapsedTime(0);
        setDistractionCount(0);
        // Refresh stats
        if (refetchStats) {
          refetchStats();
        } else {
          location.reload();
        }
      }
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setLoading(false);
    }
  };

  const pauseSession = async () => {
    if (!activeSession || activeSession.status === 'paused') return;

    setLoading(true);
    try {
      const response = await fetch(`/api/focus-sessions/${activeSession.id}/pause`, {
        method: 'POST',
      });

      if (response.ok) {
        const session = await response.json();
        setActiveSession(session);
        setElapsedTime(calculateElapsedTime(session));
      }
    } catch (error) {
      console.error('Error pausing session:', error);
    } finally {
      setLoading(false);
    }
  };

  const resumeSession = async () => {
    if (!activeSession || activeSession.status === 'active') return;

    setLoading(true);
    try {
      const response = await fetch(`/api/focus-sessions/${activeSession.id}/resume`, {
        method: 'POST',
      });

      if (response.ok) {
        const session = await response.json();
        setActiveSession(session);
        setElapsedTime(calculateElapsedTime(session));
      }
    } catch (error) {
      console.error('Error resuming session:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeSession,
    elapsedTime,
    distractionCount,
    loading,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    recordDistraction,
  };
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

export function useWhitelistedDomains() {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch('/api/whitelist');
        if (response.ok) {
          const data = await response.json();
          const domainList = Array.isArray(data)
            ? data
                .map((item: unknown) =>
                  typeof item === 'object' && item !== null && 'domain' in item
                    ? (item as { domain?: unknown }).domain
                    : null
                )
                .filter((domain): domain is string => typeof domain === 'string')
            : [];
          setDomains(domainList);
        }
      } catch (error) {
        console.error('Error fetching whitelisted domains:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  return { domains, loading };
}

/**
 * Check if the current URL's hostname matches a whitelisted domain
 * Handles exact matches and subdomains (e.g., "github.com" matches "api.github.com")
 */
function isCurrentUrlWhitelisted(whitelistedDomains: string[]): boolean {
  if (whitelistedDomains.length === 0) return false;

  try {
    const currentHostname = window.location.hostname.toLowerCase();

    for (const domain of whitelistedDomains) {
      const domainLower = domain.toLowerCase();

      // Exact match (e.g., "github.com" === "github.com")
      if (currentHostname === domainLower) {
        return true;
      }

      // Subdomain match (e.g., "api.github.com" ends with ".github.com")
      if (currentHostname.endsWith(`.${domainLower}`)) {
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking current URL against whitelist:', error);
  }

  return false;
}

export function useDistractionDetection(
  isSessionActive: boolean,
  onDistractionDetected: () => void,
  whitelistedDomains: string[]
) {
  const onDistractionDetectedRef = useRef(onDistractionDetected);

  useEffect(() => {
    onDistractionDetectedRef.current = onDistractionDetected;
  }, [onDistractionDetected]);

  useEffect(() => {
    if (!isSessionActive) return;

    let awayStartedAt: number | null = null;
    let lastRecordedAt = 0;

    const MIN_AWAY_MS = 1500;
    const RECORD_COOLDOWN_MS = 1500;

    const markAwayStart = () => {
      if (awayStartedAt === null) {
        awayStartedAt = Date.now();
      }
    };

    const maybeRecordDistraction = () => {
      if (awayStartedAt === null) return;

      const now = Date.now();
      const timeAway = now - awayStartedAt;
      awayStartedAt = null;

      if (timeAway < MIN_AWAY_MS) return;
      if (now - lastRecordedAt < RECORD_COOLDOWN_MS) return;

      // ✅ NEW: Check if current URL is whitelisted before recording distraction
      if (isCurrentUrlWhitelisted(whitelistedDomains)) {
        console.log('✓ Current domain is whitelisted, not recording distraction');
        return;
      }

      lastRecordedAt = now;
      onDistractionDetectedRef.current();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        markAwayStart();
      } else {
        maybeRecordDistraction();
      }
    };

    const handleBlur = () => {
      markAwayStart();
    };

    const handleFocus = () => {
      maybeRecordDistraction();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isSessionActive, whitelistedDomains]);
}

export { formatTime };
