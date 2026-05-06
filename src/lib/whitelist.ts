/**
 * Whitelist utility — server-side domain normalization & matching helpers.
 *
 * These functions are intentionally dependency-free so they can be imported
 * in both API routes and the Next.js middleware edge runtime.
 */

/**
 * Strip protocol, optional "www." prefix, and trailing slash so that
 * "https://www.GitHub.com/" → "github.com".
 */
export function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, ''); // remove path
}

/**
 * Return true when `hostname` matches the stored `whitelistedDomain`.
 *
 * Rules
 * ─────
 * • Exact match:     "github.com"   matches "github.com"
 * • Subdomain match: "api.github.com" matches "github.com"
 *   (i.e. the hostname must end with ".<whitelistedDomain>")
 */
export function domainMatches(hostname: string, whitelistedDomain: string): boolean {
  const host = normalizeDomain(hostname);
  const wl   = normalizeDomain(whitelistedDomain);

  return host === wl || host.endsWith(`.${wl}`);
}

/**
 * Return true when `hostname` matches any entry in `whitelistedDomains`.
 */
export function isWhitelisted(hostname: string, whitelistedDomains: string[]): boolean {
  if (!hostname || whitelistedDomains.length === 0) return false;
  return whitelistedDomains.some((d) => domainMatches(hostname, d));
}

/**
 * Extract the hostname from a full URL string (or return an empty string on
 * parse failure so callers don't have to catch).
 */
export function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
