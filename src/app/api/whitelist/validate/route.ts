import { requireAuth, AuthError } from '@/lib/clerk-auth';
import { prisma } from '@/lib/prisma';
import { isWhitelisted, normalizeDomain } from '@/lib/whitelist';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/whitelist/validate?domain=github.com
 *
 * Returns whether the given domain is in the authenticated user's whitelist.
 *
 * Response shape
 * ──────────────
 * { whitelisted: boolean; domain: string }
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const rawDomain = searchParams.get('domain');

    if (!rawDomain) {
      return NextResponse.json(
        { error: 'domain query parameter is required' },
        { status: 400 }
      );
    }

    const domain = normalizeDomain(rawDomain);

    // Fetch user's whitelisted domains from the database
    const storedDomains = await prisma.whitelistedDomain.findMany({
      where: { userId: user.id },
      select: { domain: true },
    });

    const domainList = storedDomains.map((d) => d.domain);
    const whitelisted = isWhitelisted(domain, domainList);

    return NextResponse.json({ whitelisted, domain });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error validating domain:', error);
    return NextResponse.json(
      { error: 'Failed to validate domain' },
      { status: 500 }
    );
  }
}
