import { requireAuth, AuthError } from '@/lib/clerk-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all whitelisted domains for the user
export async function GET() {
  try {
    const user = await requireAuth();

    const domains = await prisma.whitelistedDomain.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(domains);
  } catch (error) {
    console.error('Error fetching whitelisted domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch whitelisted domains' },
      { status: 500 }
    );
  }
}

// POST - Add a new whitelisted domain
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { domain, description } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Normalize domain (remove protocol, www, trailing slash)
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/$/, '');

    // Check if already exists
    const existing = await prisma.whitelistedDomain.findUnique({
      where: {
        userId_domain: {
          userId: user.id,
          domain: normalizedDomain,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Domain already whitelisted' },
        { status: 400 }
      );
    }

    const whitelistedDomain = await prisma.whitelistedDomain.create({
      data: {
        userId: user.id,
        domain: normalizedDomain,
        description: description || null,
      },
    });

    return NextResponse.json(whitelistedDomain, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error adding whitelisted domain:', error);
    return NextResponse.json(
      { error: 'Failed to add whitelisted domain' },
      { status: 500 }
    );
  }
}
