import { requireAuth } from '@/lib/clerk-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// DELETE - Remove a whitelisted domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    const { id } = await params;

    // Verify the domain belongs to the user
    const domain = await prisma.whitelistedDomain.findUnique({
      where: { id },
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    if (domain.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this domain' },
        { status: 403 }
      );
    }

    await prisma.whitelistedDomain.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting whitelisted domain:', error);
    return NextResponse.json(
      { error: 'Failed to delete whitelisted domain' },
      { status: 500 }
    );
  }
}
