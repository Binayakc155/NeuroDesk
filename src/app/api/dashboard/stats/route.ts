import { requireAuth, AuthError } from '@/lib/clerk-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await requireAuth();

    // Get user stats
    const focusSessions = await prisma.focusSession.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'desc' },
    });

    // Calculate stats
    const totalSessions = focusSessions.length;
    const now = Date.now();
    const totalDuration = focusSessions.reduce((sum, session) => {
      if (session.endTime) {
        return sum + session.duration;
      }

      const liveDuration = Math.floor(
        (now - new Date(session.startTime).getTime()) / 1000
      );
      const activePauseDuration = session.pausedAt
        ? Math.floor((now - new Date(session.pausedAt).getTime()) / 1000)
        : 0;
      const currentDuration = Math.max(
        0,
        liveDuration - session.pausedDuration - activePauseDuration
      );
      return sum + currentDuration;
    }, 0);
    const totalHours = Math.round((totalDuration / 3600) * 10) / 10;

    // Improved focus score calculation
    const DISTRACTION_PENALTY_SECONDS = 10;
    const totalDistractedTime = focusSessions.reduce(
      (sum, session) => sum + (session.distractionCount * DISTRACTION_PENALTY_SECONDS),
      0
    );
    const totalDistractions = focusSessions.reduce(
      (sum, session) => sum + session.distractionCount,
      0
    );

    let focusScore = totalDuration > 0
      ? Math.max(0, Math.min(100, 100 - (totalDistractedTime / totalDuration) * 100))
      : 100;

    if (totalDistractions > 0) {
      focusScore = Math.min(focusScore, 99);
    }

    const safeFocusScore = Number.isFinite(focusScore)
      ? Math.round(focusScore)
      : 100;

    return NextResponse.json({
      totalSessions,
      totalHours,
      focusScore: safeFocusScore,
      recentSessions: focusSessions.slice(0, 5),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
