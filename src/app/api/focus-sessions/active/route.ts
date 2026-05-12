import { requireAuth, AuthError } from '@/lib/clerk-auth';
import { prisma } from '@/lib/prisma';
import { FocusSession } from '@prisma/client';
import { NextResponse } from 'next/server';

function toActiveSessionResponse(session: FocusSession | null) {
  if (!session) return null;

  return {
    id: session.id,
    startTime: session.startTime.toISOString(),
    status: session.status,
    pausedAt: session.pausedAt ? session.pausedAt.toISOString() : null,
    pausedDuration: session.pausedDuration ?? 0,
    distractionCount: session.distractionCount ?? 0,
  };
}

export async function POST() {
  try {
    const user = await requireAuth();

    const existingActiveSession = await prisma.focusSession.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      orderBy: { startTime: 'desc' },
    });

    if (existingActiveSession) {
      return NextResponse.json(
        { activeSession: toActiveSessionResponse(existingActiveSession) },
        { status: 200 }
      );
    }

    // Create a new focus session
    const focusSession = await prisma.focusSession.create({
      data: {
        userId: user.id,
        startTime: new Date(),
      },
    });

    return NextResponse.json(
      { activeSession: toActiveSessionResponse(focusSession) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error creating focus session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await requireAuth();

    // Get active focus session (no end time)
    const activeSession = await prisma.focusSession.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ activeSession: toActiveSessionResponse(activeSession) });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error fetching active session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
