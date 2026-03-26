import { requireAuth } from '@/lib/clerk-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch user preferences
export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json({
      preferredSound: user.preferredSound || 'none',
      soundVolume: user.soundVolume || 50,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PATCH - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { preferredSound, soundVolume } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(preferredSound !== undefined && { preferredSound }),
        ...(soundVolume !== undefined && { soundVolume }),
      },
      select: {
        preferredSound: true,
        soundVolume: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
