import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all custom sounds for the user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const sounds = await prisma.customSound.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sounds);
  } catch (error) {
    console.error('Error fetching custom sounds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom sounds' },
      { status: 500 }
    );
  }
}

// POST - Add a new custom sound
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, url, icon } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const sound = await prisma.customSound.create({
      data: {
        userId: user.id,
        name,
        url,
        icon: icon || '🎵',
      },
    });

    return NextResponse.json(sound, { status: 201 });
  } catch (error) {
    console.error('Error creating custom sound:', error);
    return NextResponse.json(
      { error: 'Failed to create custom sound' },
      { status: 500 }
    );
  }
}
