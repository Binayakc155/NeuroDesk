import { requireAuth, AuthError } from '@/lib/clerk-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { validateSessionStructure, getSessionValidationError } from '@/lib/session-normalizer';

/**
 * Normalize a session object to ensure all required fields have proper defaults
 */
function normalizeFocusSessionResponse(session: any) {
  if (!session) return null;

  return {
    id: session.id,
    userId: session.userId,
    startTime: session.startTime,
    endTime: session.endTime || null,
    status: session.status || 'active',
    pausedAt: session.pausedAt || null,
    pausedDuration: typeof session.pausedDuration === 'number' ? session.pausedDuration : 0,
    distractionCount: typeof session.distractionCount === 'number' ? session.distractionCount : 0,
  };
}

export async function POST() {
  try {
    const user = await requireAuth();

    // Check for existing active session
    const existingActiveSession = await prisma.focusSession.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      orderBy: { startTime: 'desc' },
    });

    if (existingActiveSession) {
      // Validate and normalize the existing session
      if (!validateSessionStructure(existingActiveSession)) {
        const errorMsg = getSessionValidationError(existingActiveSession);
        console.error('Existing session validation failed:', errorMsg, existingActiveSession);
        return NextResponse.json(
          { error: 'Session structure invalid: ' + errorMsg },
          { status: 500 }
        );
      }

      const normalizedSession = normalizeFocusSessionResponse(existingActiveSession);
      return NextResponse.json({ activeSession: normalizedSession }, { status: 200 });
    }

    // Create a new focus session
    const focusSession = await prisma.focusSession.create({
      data: {
        userId: user.id,
        startTime: new Date(),
        status: 'active',
        pausedAt: null,
        pausedDuration: 0,
        distractionCount: 0,
      },
    });

    // Validate and normalize the newly created session
    if (!validateSessionStructure(focusSession)) {
      const errorMsg = getSessionValidationError(focusSession);
      console.error('New session validation failed:', errorMsg, focusSession);
      return NextResponse.json(
        { error: 'Failed to create valid session: ' + errorMsg },
        { status: 500 }
      );
    }

    const normalizedSession = normalizeFocusSessionResponse(focusSession);
    return NextResponse.json({ activeSession: normalizedSession }, { status: 201 });
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

    if (!activeSession) {
      return NextResponse.json({ activeSession: null });
    }

    // Validate session structure
    if (!validateSessionStructure(activeSession)) {
      const errorMsg = getSessionValidationError(activeSession);
      console.error('Active session validation failed:', errorMsg, activeSession);
      // Return null instead of error to gracefully handle invalid sessions
      return NextResponse.json({ activeSession: null });
    }

    // Normalize and return the session
    const normalizedSession = normalizeFocusSessionResponse(activeSession);
    return NextResponse.json({ activeSession: normalizedSession });
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
