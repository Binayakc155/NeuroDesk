/**
 * Session normalizer - ensures all session fields have proper defaults
 * Prevents "session is not started" errors from missing fields
 */

export interface NormalizedFocusSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  status: 'active' | 'paused' | 'completed';
  pausedAt: Date | null;
  pausedDuration: number;
  distractionCount: number;
}

/**
 * Normalize a focus session object to ensure all required fields exist with proper defaults
 */
export function normalizeFocusSession(
  session: Record<string, any>
): NormalizedFocusSession {
  if (!session || typeof session !== 'object') {
    throw new Error('Invalid session object');
  }

  if (!session.id || !session.userId) {
    throw new Error('Session missing required fields: id or userId');
  }

  return {
    id: session.id,
    userId: session.userId,
    startTime: session.startTime ? new Date(session.startTime) : new Date(),
    endTime: session.endTime ? new Date(session.endTime) : null,
    status: session.status || 'active',
    pausedAt: session.pausedAt ? new Date(session.pausedAt) : null,
    pausedDuration: typeof session.pausedDuration === 'number' ? session.pausedDuration : 0,
    distractionCount: typeof session.distractionCount === 'number' ? session.distractionCount : 0,
  };
}

/**
 * Validate that a session has all required fields
 */
export function validateSessionStructure(session: any): boolean {
  if (!session || typeof session !== 'object') return false;

  const requiredFields = ['id', 'userId', 'startTime'];
  return requiredFields.every((field) => field in session && session[field] !== undefined);
}

/**
 * Get detailed error message for invalid session
 */
export function getSessionValidationError(session: any): string {
  if (!session || typeof session !== 'object') {
    return 'Session object is invalid or null';
  }

  const missingFields = [];
  const requiredFields = ['id', 'userId', 'startTime'];

  for (const field of requiredFields) {
    if (!(field in session) || session[field] === undefined) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return `Session missing required fields: ${missingFields.join(', ')}`;
  }

  return 'Session structure is invalid';
}
