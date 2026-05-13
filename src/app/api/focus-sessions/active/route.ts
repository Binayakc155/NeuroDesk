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
    console.log('Starting session creation for user:', user.id);

    // Check for existing active session
    const existingActiveSession = await prisma.focusSession.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      orderBy: { startTime: 'desc' },
    });

    if (existingActiveSession) {
      // Reset existing session so timer starts from 0
      const resetSession = await prisma.focusSession.update({
        where: { id: existingActiveSession.id },
        data: {
          startTime: new Date(),
          status: 'active',
          pausedAt: null,
          pausedDuration: 0,
          distractionCount: 0,
        },
      });

      const normalizedSession = normalizeFocusSessionResponse(resetSession);
      return NextResponse.json({ activeSession: normalizedSession }, { status: 200 });
    }

    // Create a new focus session
    console.log('Creating new focus session...');
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

    console.log('Created session from DB:', JSON.stringify(focusSession, null, 2));

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
    console.log('Returning normalized new session:', normalizedSession);
    return NextResponse.json({ activeSession: normalizedSession }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/focus-sessions/active:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Full error details:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to create session: ' + errorMessage },
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
      console.log('No active session found for user:', user.id);
      return NextResponse.json({ activeSession: null });
    }

    console.log('Found active session:', activeSession);

    // Validate session structure
    if (!validateSessionStructure(activeSession)) {
      const errorMsg = getSessionValidationError(activeSession);
      console.error('Active session validation failed:', errorMsg, activeSession);
      // Return null instead of error to gracefully handle invalid sessions
      return NextResponse.json({ activeSession: null });
    }

    // Normalize and return the session
    const normalizedSession = normalizeFocusSessionResponse(activeSession);
    console.log('Returning normalized session:', normalizedSession);
    return NextResponse.json({ activeSession: normalizedSession });
  } catch (error) {
    console.error('Error in GET /api/focus-sessions/active:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch session: ' + errorMessage },
      { status: 500 }
    );
  }
}
