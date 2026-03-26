import { requireAuth } from '@/lib/clerk-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// DELETE - Remove a custom sound
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

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
