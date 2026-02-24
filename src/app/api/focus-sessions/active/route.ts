import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create a new focus session
    const focusSession = await prisma.focusSession.create({
      data: {
        userId: session.user.id,
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active focus session (no end time)
    const activeSession = await prisma.focusSession.findFirst({
      where: {
        userId: session.user.id,
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
