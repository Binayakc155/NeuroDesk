import { auth } from '@/lib/auth';
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
 * Resolve the current authenticated user to a DB user ID.
 * Returns user ID if found, otherwise throws AuthError.
 */
export async function getClerkUser() {
    const user = await getAuthenticatedUser();
    return user.id;
}

/**
 * Get the authenticated user from NextAuth session and resolve to DB user.
 * Returns the DB user or throws an AuthError.
 * Auto-creates users in the database by email if they don't exist.
 */
export async function getAuthenticatedUser() {
    const session = await auth();

    if (!session?.user?.id && !session?.user?.email) {
        throw new AuthError(401, 'Unauthorized');
    }

    let user = null;

    if (session.user.id) {
        user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });
    }

    if (!user && session.user.email) {
        user = await prisma.user.upsert({
            where: { email: session.user.email },
            update: {
                name: session.user.name,
                image: session.user.image,
            },
            create: {
                email: session.user.email,
                name: session.user.name,
                image: session.user.image,
            },
        });
    }

    if (!user) {
        throw new AuthError(401, 'Unauthorized');
    }

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
