import { requireAuth, AuthError } from '@/lib/clerk-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// POST - Record a distraction during an active session
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { focusSessionId, description } = body;

    if (!focusSessionId) {
      return NextResponse.json(
        { error: 'Focus session ID is required' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user and is active
    const focusSession = await prisma.focusSession.findUnique({
      where: { id: focusSessionId },
    });

    if (!focusSession) {
      return NextResponse.json(
        { error: 'Focus session not found' },
        { status: 404 }
      );
    }

    if (focusSession.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (focusSession.endTime) {
      return NextResponse.json(
        { error: 'Cannot add distraction to ended session' },
        { status: 400 }
      );
    }

    // Create distraction record
    const distraction = await prisma.distraction.create({
      data: {
        focusSessionId,
        description: description || 'Tab switch detected',
      },
    });

    // Increment distraction count on the session
    const updatedSession = await prisma.focusSession.update({
      where: { id: focusSessionId },
      data: {
        distractionCount: { increment: 1 },
        isDistracted: true,
      },
    });

    return NextResponse.json({
      distraction,
      totalDistractions: updatedSession.distractionCount,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error recording distraction:', error);
    return NextResponse.json(
      { error: 'Failed to record distraction' },
      { status: 500 }
    );
  }
}
