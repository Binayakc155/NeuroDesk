'use client';

import { useEffect, useRef, useState } from 'react';
import {
  NormalizedFocusSession,
  validateSessionStructure,
  getSessionValidationError,
} from '@/lib/session-normalizer';

type FocusSessionStatus = 'active' | 'paused' | 'completed';

interface ActiveFocusSession {
  id: string;
  startTime: string;
  status: FocusSessionStatus;
  pausedAt: string | null;
  pausedDuration: number;
  distractionCount: number;
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
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [localStartTime, setLocalStartTime] = useState<number | null>(null);

  // Fetch active session on mount
  useEffect(() => {
    fetchActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer for elapsed time
  useEffect(() => {
    if (!activeSession || localStartTime === null) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const currentPauseDuration = activeSession.pausedAt
        ? Math.floor((now - new Date(activeSession.pausedAt).getTime()) / 1000)
        : 0;
      const elapsed = Math.max(
        0,
        Math.floor((now - localStartTime) / 1000) -
          (activeSession.pausedDuration || 0) -
          currentPauseDuration
      );
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, localStartTime]);

  const calculateElapsedTime = (
    session: ActiveFocusSession,
    referenceNow: number = Date.now()
  ) => {
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
  };

  /**
   * Validate session structure with detailed error reporting
   */
  const validateAndNormalizeSession = (
    session: any
  ): ActiveFocusSession | null => {
    if (!session) {
      console.warn('Session is null or undefined');
      return null;
    }

    if (!validateSessionStructure(session)) {
      const errorMsg = getSessionValidationError(session);
      console.error('Session validation failed:', errorMsg, session);
      setError(errorMsg);
      return null;
    }

    // Ensure all required fields have proper defaults
    return {
      id: session.id,
      startTime: typeof session.startTime === 'string'
        ? session.startTime
        : new Date(session.startTime).toISOString(),
      status: session.status || 'active',
      pausedAt: session.pausedAt || null,
      pausedDuration: session.pausedDuration ?? 0,
      distractionCount: session.distractionCount ?? 0,
    };
  };

  const fetchActiveSession = async () => {
    try {
      const response = await fetch('/api/focus-sessions/active');
      if (response.ok) {
        const data = await response.json();
        const session = data.activeSession;

        if (session) {
          const validatedSession = validateAndNormalizeSession(session);
          if (!validatedSession) {
            console.error('Failed to validate session');
            setActiveSession(null);
            return;
          }

          setActiveSession(validatedSession);
          const now = Date.now();
          setLocalStartTime(new Date(validatedSession.startTime).getTime());
          setElapsedTime(calculateElapsedTime(validatedSession, now));
          setDistractionCount(validatedSession.distractionCount || 0);
          setError(null);
        } else {
          setElapsedTime(0);
          setDistractionCount(0);
          setLocalStartTime(null);
          setActiveSession(null);
        }
      }
    } catch (err) {
      console.error('Error fetching active session:', err);
      setError(err instanceof Error ? err.message : 'Error fetching session');
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
    } catch (err) {
      console.error('Error recording distraction:', err);
    }
  };

  const startSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/focus-sessions/active', {
        method: 'POST',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = data?.error || 'Failed to start focus session';
        console.error('Failed to start session:', response.status, errorMessage);
        setError(errorMessage);
        return;
      }

      const session = data?.activeSession;
      if (!session) {
        const errorMessage = 'No active session was returned';
        console.error(errorMessage, data);
        setError(errorMessage);
        return;
      }

      // Validate and normalize the session
      const validatedSession = validateAndNormalizeSession(session);
      if (!validatedSession) {
        console.error('Session validation failed after creation');
        return;
      }

      setActiveSession(validatedSession);
      setLocalStartTime(new Date(validatedSession.startTime).getTime());
      setElapsedTime(0);
      setDistractionCount(validatedSession?.distractionCount || 0);
      setError(null);
      if (refetchStats) {
        refetchStats();
      }
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Error starting session');
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
        setLocalStartTime(null);
        // Refresh stats
        if (refetchStats) {
          refetchStats();
        } else {
          location.reload();
        }
      }
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err instanceof Error ? err.message : 'Error ending session');
    } finally {
      setLoading(false);
    }
  };

  const pauseSession = async () => {
    if (!activeSession || activeSession.status === 'paused') return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/focus-sessions/${activeSession.id}/pause`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMessage = data?.error || 'Failed to pause focus session';
        console.error('Failed to pause session:', response.status, errorMessage);
        setError(errorMessage);
        return;
      }

      if (data) {
        const validatedSession = validateAndNormalizeSession(data);
        if (validatedSession) {
          setActiveSession(validatedSession);
          setElapsedTime(calculateElapsedTime(validatedSession));
        }
      }
    } catch (err) {
      console.error('Error pausing session:', err);
      setError(err instanceof Error ? err.message : 'Error pausing session');
    } finally {
      setLoading(false);
    }
  };

  const resumeSession = async () => {
    if (!activeSession || activeSession.status === 'active') return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/focus-sessions/${activeSession.id}/resume`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMessage = data?.error || 'Failed to resume focus session';
        console.error('Failed to resume session:', response.status, errorMessage);
        setError(errorMessage);
        return;
      }

      if (data) {
        const validatedSession = validateAndNormalizeSession(data);
        if (validatedSession) {
          setActiveSession(validatedSession);
          setElapsedTime(calculateElapsedTime(validatedSession));
        }
      }
    } catch (err) {
      console.error('Error resuming session:', err);
      setError(err instanceof Error ? err.message : 'Error resuming session');
    } finally {
      setLoading(false);
    }
  };

  return {
    activeSession,
    elapsedTime,
    distractionCount,
    loading,
    error,
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
      } catch (err) {
        console.error('Error fetching whitelisted domains:', err);
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
  } catch (err) {
    console.error('Error checking current URL against whitelist:', err);
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
