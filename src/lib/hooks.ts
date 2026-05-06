'use client';

import { useEffect, useRef, useState } from 'react';
import { domainMatches, extractHostname } from './whitelist';

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
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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
      const now = new Date().getTime();
      const elapsed = Math.floor((now - localStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, localStartTime]);

  const fetchActiveSession = async () => {
    try {
      const response = await fetch('/api/focus-sessions/active');
      if (response.ok) {
        const data = await response.json();
        setActiveSession(data.activeSession);
        if (data.activeSession) {
          // Calculate how far into the session we are, then set local start time to match
          const now = new Date().getTime();
          const serverStartTime = new Date(data.activeSession.startTime).getTime();
          const elapsedMs = now - serverStartTime;
          setLocalStartTime(now - elapsedMs);
          setDistractionCount(data.activeSession.distractionCount || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const recordDistraction = async (description?: string) => {
    if (!activeSession) return;

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
      // Set local start time immediately (before API call)
      const now = new Date().getTime();
      setLocalStartTime(now);
      setElapsedTime(0);

      const response = await fetch('/api/focus-sessions/active', {
        method: 'POST',
      });
      if (response.ok) {
        const session = await response.json();
        setActiveSession(session);
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
        setLocalStartTime(null);
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

  return {
    activeSession,
    elapsedTime,
    distractionCount,
    loading,
    startSession,
    endSession,
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
          setDomains(data.map((d: any) => d.domain));
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
 * Ask the server whether `domain` is in the current user's whitelist.
 * Returns false on any network/auth error so the app degrades safely.
 */
async function checkDomainWhitelistedViaApi(domain: string): Promise<boolean> {
  if (!domain) return false;
  try {
    const res = await fetch(
      `/api/whitelist/validate?domain=${encodeURIComponent(domain)}`
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.whitelisted);
  } catch {
    return false;
  }
}

/**
 * Best-effort attempt to determine the hostname the user departed to.
 *
 * The Page Visibility API only tells us *that* the user left the tab — it
 * cannot reveal which external URL they visited.  We use `document.referrer`
 * as a heuristic: when the user navigates back to NeuroDesk from an external
 * page via a link, the referrer reflects that origin.  For simple tab
 * switches the referrer is usually empty or equal to the current origin, in
 * which case we return '' and the caller falls back to conservative behaviour.
 */
function getDepartedHostname(): string {
  try {
    const referrer = document.referrer;
    if (!referrer) return '';
    const referrerHostname = extractHostname(referrer);
    // Ignore if the referrer is just the NeuroDesk app itself
    if (referrerHostname === window.location.hostname) return '';
    return referrerHostname;
  } catch {
    return '';
  }
}

export function useDistractionDetection(
  isSessionActive: boolean,
  onDistractionDetected: () => void,
  whitelistedDomains: string[]
) {
  const onDistractionDetectedRef = useRef(onDistractionDetected);
  const whitelistedDomainsRef = useRef(whitelistedDomains);

  useEffect(() => {
    onDistractionDetectedRef.current = onDistractionDetected;
  }, [onDistractionDetected]);

  useEffect(() => {
    whitelistedDomainsRef.current = whitelistedDomains;
  }, [whitelistedDomains]);

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

    const maybeRecordDistraction = async () => {
      if (awayStartedAt === null) return;

      const now = Date.now();
      const timeAway = now - awayStartedAt;
      awayStartedAt = null;

      if (timeAway < MIN_AWAY_MS) return;
      if (now - lastRecordedAt < RECORD_COOLDOWN_MS) return;

      // First, try a fast client-side check against the in-memory list.
      // This covers the case where the referrer gives us the departed URL.
      const departedHostname = getDepartedHostname();

      if (departedHostname) {
        const domains = whitelistedDomainsRef.current;

        // Client-side check (synchronous, no network)
        const locallyWhitelisted = domains.some((d) => domainMatches(departedHostname, d));

        if (locallyWhitelisted) {
          console.log(`✓ Departed domain "${departedHostname}" is whitelisted (local check) — not recording distraction`);
          return;
        }

        // Server-side validation as a fallback (authoritative, handles
        // cases where the in-memory list may be stale).
        const serverWhitelisted = await checkDomainWhitelistedViaApi(departedHostname);
        if (serverWhitelisted) {
          console.log(`✓ Departed domain "${departedHostname}" is whitelisted (server check) — not recording distraction`);
          return;
        }
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
  }, [isSessionActive]);
}

export { formatTime };
