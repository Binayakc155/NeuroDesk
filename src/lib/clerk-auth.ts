import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Resolve the current authenticated Clerk user to a DB user record.
 * Returns the DB user or throws AuthError.
 */
export async function getAuthenticatedUser() {
  const { userId } = auth();

  if (!userId) {
    throw new AuthError(401, 'Unauthorized');
  }

  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // If you want auto-create with email, fetch from Clerk here.
  // Otherwise, just enforce that the user exists in DB.
  if (!user) {
    throw new AuthError(401, 'Unauthorized');
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
