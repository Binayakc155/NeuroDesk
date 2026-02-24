/**
 * Calculate focus score based on session duration and distraction count
 * Scale: 0-100
 * Formula: (duration in minutes / 60) * 100 - (distraction_count * 10)
 * Capped between 0-100
 */
export function calculateFocusScore(
  durationSeconds: number,
  distractionCount: number
): number {
  const durationMinutes = durationSeconds / 60;
  const baseScore = (durationMinutes / 60) * 100; // Normalize to 100 for 1 hour
  const distractionPenalty = distractionCount * 10;
  const score = baseScore - distractionPenalty;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate weekly focus score average
 */
export function calculateWeeklyFocusScore(
  totalFocusHours: number,
  totalDistractions: number,
  sessionCount: number
): number {
  if (sessionCount === 0) return 0;
  
  const avgDurationHours = totalFocusHours / sessionCount;
  const avgDistractions = totalDistractions / sessionCount;
  
  return calculateFocusScore(avgDurationHours * 3600, avgDistractions);
}

/**
 * Convert seconds to readable format (e.g., "2h 30m")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Get the start and end of the current week (Monday to Sunday)
 */
export function getWeekRange(date: Date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  
  const weekStart = new Date(d.setDate(diff));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  return {
    start: new Date(weekStart.setHours(0, 0, 0, 0)),
    end: new Date(weekEnd.setHours(23, 59, 59, 999)),
  };
}

/**
 * Get the start and end of a specific month
 */
export function getMonthRange(date: Date = new Date()) {
  const d = new Date(date);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
  const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  
  return {
    start: new Date(monthStart.setHours(0, 0, 0, 0)),
    end: new Date(monthEnd.setHours(23, 59, 59, 999)),
  };
}
