import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user stats
    const focusSessions = await prisma.focusSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: 'desc' },
    });

    // Calculate stats
    const totalSessions = focusSessions.length;
    const totalDuration = focusSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = Math.round((totalDuration / 3600) * 10) / 10;

    // Improved focus score calculation
    const DISTRACTION_PENALTY_SECONDS = 10;
    const totalDistractedTime = focusSessions.reduce(
      (sum, session) => sum + (session.distractionCount * DISTRACTION_PENALTY_SECONDS),
      0
    );
    const focusScore = totalDuration > 0
      ? Math.max(0, 100 - (totalDistractedTime / totalDuration) * 100)
      : 0;

    return NextResponse.json({
      totalSessions,
      totalHours,
      focusScore: Math.round(focusScore),
      recentSessions: focusSessions.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}