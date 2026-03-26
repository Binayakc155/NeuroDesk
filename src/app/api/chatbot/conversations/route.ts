import { requireAuth } from '@/lib/clerk-auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await requireAuth();

    const conversations = await prisma.chatConversation.findMany({
      where: { userId: user.id },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const user = await requireAuth();

    const conversation = await prisma.chatConversation.create({
      data: {
        userId: user.id,
        title: 'New Chat',
        messages: {
          create: [],
        },
      },
      include: { messages: true },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
