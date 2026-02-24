'use client';

import { useEffect, useState } from 'react';

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    focusScore: 0,
    recentSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
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

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useFocusSession() {
  const [activeSession, setActiveSession] = useState<any>(null);
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

    const now = new Date().getTime();
    const startTime = new Date(activeSession.startTime).getTime();
    const initialElapsed = Math.floor((now - startTime) / 1000);
    setElapsedTime(initialElapsed);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(activeSession.startTime).getTime();
      setElapsedTime(Math.floor((now - startTime) / 1000));
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
      }
    } catch (error) {
      console.error('Error recording distraction:', error);
    }
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/focus-sessions/active', {
        method: 'POST',
      });
      if (response.ok) {
        const session = await response.json();
        setActiveSession(session);
        setElapsedTime(0);
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
        // Refresh stats
        location.reload();
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

export function useDistractionDetection(
  isSessionActive: boolean,
  onDistractionDetected: () => void,
  whitelistedDomains: string[]
) {
  useEffect(() => {
    if (!isSessionActive) return;

    let hideTime: number | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab - record when they left
        hideTime = Date.now();
      } else {
        // User came back to the tab
        if (hideTime) {
          const timeAway = Date.now() - hideTime;
          
          // If away for more than 3 seconds, record as distraction
          // Note: We can't detect which site they went to with Page Visibility API
          // A browser extension would be needed to check against whitelist
          if (timeAway > 3000) {
            onDistractionDetected();
          }
          
          hideTime = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSessionActive, onDistractionDetected, whitelistedDomains]);
}

export { formatTime };
