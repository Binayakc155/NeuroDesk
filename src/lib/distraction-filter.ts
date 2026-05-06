/**
 * Distraction-filter utilities.
 *
 * These helpers decide — for a given URL / hostname — whether a visit should
 * count as a distraction given the user's current whitelist.
 *
 * They are pure functions (no I/O) so they can safely be used in the
 * middleware edge runtime, in API routes, and on the client.
 */

import { isWhitelisted, extractHostname, normalizeDomain } from './whitelist';

/**
 * Common entertainment / social / news domains that are almost always
 * considered distracting in a focus context.  This list is intentionally
 * small — the user's own whitelist is the source of truth.
 */
const KNOWN_DISTRACTING_DOMAINS = [
  'youtube.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'reddit.com',
  'tiktok.com',
  'netflix.com',
  'twitch.tv',
  'discord.com',
  'whatsapp.com',
  'telegram.org',
  'snapchat.com',
  'pinterest.com',
  'tumblr.com',
];

/**
 * Return true when `hostname` belongs to a well-known distracting domain.
 */
export function isKnownDistractingDomain(hostname: string): boolean {
  const host = normalizeDomain(hostname);
  return KNOWN_DISTRACTING_DOMAINS.some(
    (d) => host === d || host.endsWith(`.${d}`)
  );
}

/**
 * Core filter function.
 *
 * A visit to `url` is considered a distraction when:
 *   1. The URL is not empty / parse-able, AND
 *   2. The hostname is NOT in the user's `whitelistedDomains`.
 *
 * If the url is empty (e.g. we don't know where the user went), the function
 * conservatively returns `true` so the existing fallback behaviour is
 * preserved.
 */
export function isDistracting(url: string, whitelistedDomains: string[]): boolean {
  if (!url) return true;

  const hostname = extractHostname(url);
  if (!hostname) return true;

  return !isWhitelisted(hostname, whitelistedDomains);
}

/**
 * Build a human-readable reason string for a distraction event.
 */
export function buildDistractionDescription(url: string, whitelistedDomains: string[]): string {
  if (!url) return 'Tab switch detected';

  const hostname = extractHostname(url);
  if (!hostname) return 'Tab switch detected';

  if (isWhitelisted(hostname, whitelistedDomains)) {
    return `Visited whitelisted domain: ${hostname}`;
  }

  if (isKnownDistractingDomain(hostname)) {
    return `Visited distracting site: ${hostname}`;
  }

  return `Tab switch to ${hostname}`;
}
