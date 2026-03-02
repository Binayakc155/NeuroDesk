import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// DELETE - Remove a custom sound
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const sound = await prisma.customSound.findUnique({
      where: { id },
    });

    if (!sound) {
      return NextResponse.json(
        { error: 'Sound not found' },
        { status: 404 }
      );
    }

    if (sound.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.customSound.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Sound deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom sound:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom sound' },
      { status: 500 }
    );
  }
}
