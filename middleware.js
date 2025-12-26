// middleware.js
// Vercel Edge Middleware for global API rate limiting (JavaScript-only)
// Default: 10 requests/minute/IP for all /api/* endpoints

import { NextResponse } from 'next/server';

// Simple in-memory LRU cache for request counts (resets on cold start)
const RATE_LIMIT = 10; // requests per window
const WINDOW = 60 * 1000; // 1 minute in ms

const ipCache = new Map();

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  // Use x-forwarded-for or remote address
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  const now = Date.now();
  let entry = ipCache.get(ip);

  if (!entry || now - entry.start > WINDOW) {
    // New window
    entry = { count: 1, start: now };
  } else {
    entry.count += 1;
  }

  ipCache.set(ip, entry);

  if (entry.count > RATE_LIMIT) {
    // Optional: log or monitor 429s here
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Optional: prune old entries to avoid memory leaks
  if (ipCache.size > 10000) {
    for (const [k, v] of ipCache) {
      if (now - v.start > WINDOW) ipCache.delete(k);
    }
  }

  return NextResponse.next();
}

// Apply only to /api/* endpoints
export const config = {
  matcher: ['/api/:path*'],
};

/*
  To adjust limits:
    - Change RATE_LIMIT for requests per window
    - Change WINDOW for window duration (ms)
  Optional advanced:
    - Add per-endpoint logic using pathname
    - Track by user+IP if user info is available in request
    - Add logging/monitoring in the 429 block
*/
