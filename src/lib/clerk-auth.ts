import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export class AuthError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

/**
 * Resolve the current Clerk user to a DB user.
 * Returns user ID if found, otherwise throws AuthError.
 */
export async function getClerkUser() {
    const session = await auth();

    if (!session || !session.userId) {
        throw new AuthError(401, 'Unauthorized');
    }

    return session.userId;
}

/**
 * Get the authenticated user from Clerk and resolve to DB user.
 * Returns the DB user or throws an AuthError.
 * Auto-creates users in the database if they don't exist (first-time Clerk auth).
 */
export async function getAuthenticatedUser() {
    const session = await auth();

    if (!session || !session.userId) {
        throw new AuthError(401, 'Unauthorized');
    }

    // Get full user object from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new AuthError(401, 'Unauthorized');
    }

    // Get primary email from Clerk user
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
        throw new AuthError(400, 'User email not found');
    }

    // Try to find or create user by email (upsert pattern)
    const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
            clerkId: clerkUser.id,
            name: clerkUser.firstName || clerkUser.username,
            image: clerkUser.imageUrl,
        },
        create: {
            email: userEmail,
            clerkId: clerkUser.id,
            name: clerkUser.firstName || clerkUser.username || null,
            image: clerkUser.imageUrl || null,
        },
    });

    return user;
}

/**
 * Middleware-like function to protect API routes.
 * Usage: Try-catch and handle AuthError, or use in API routes directly.
 */
export async function requireAuth() {
    return await getAuthenticatedUser();
}

/**
 * Helper to handle auth errors in API routes.
 * Usage: catch (error) { return handleAuthError(error); }
 */
export function handleAuthError(error: unknown) {
    if (error instanceof AuthError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.status }
        );
    }
    console.error('Auth error:', error);
    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
}
