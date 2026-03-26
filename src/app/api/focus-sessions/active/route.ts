import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

async function resolveCurrentUser() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const user = session.user.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  const fallbackUser = !user && session.user.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  const resolvedUser = user || fallbackUser;

  if (!resolvedUser) {
    return { error: NextResponse.json({ error: 'User not found' }, { status: 404 }) };
  }

  return { user: resolvedUser };
}

export async function POST() {
  try {
    const current = await resolveCurrentUser();
    if (current.error) {
      return current.error;
    }

    const { user } = current;

    const existingActiveSession = await prisma.focusSession.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      orderBy: { startTime: 'desc' },
    });

    if (existingActiveSession) {
      return NextResponse.json(existingActiveSession, { status: 200 });
    }

    // Create a new focus session
    const focusSession = await prisma.focusSession.create({
      data: {
        userId: user.id,
        startTime: new Date(),
      },
    });

    return NextResponse.json(focusSession, { status: 201 });
  } catch (error) {
    console.error('Error creating focus session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const current = await resolveCurrentUser();
    if (current.error) {
      return current.error;
    }

    const { user } = current;

    // Get active focus session (no end time)
    const activeSession = await prisma.focusSession.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ activeSession });
  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
