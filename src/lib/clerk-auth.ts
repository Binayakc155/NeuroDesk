import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new AuthError(401, 'Unauthorized');
  }

  // clerkId is not unique in schema, so use findFirst
  let user = await prisma.user.findFirst({
    where: { clerkId: userId },
  });

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      throw new AuthError(401, 'Unauthorized');
    }

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name:
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
          clerkUser.username ||
          null,
        image: clerkUser.imageUrl || null,
      },
    });
  }

  return user;
}

export async function requireAuth() {
  return await getAuthenticatedUser();
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('Auth error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
