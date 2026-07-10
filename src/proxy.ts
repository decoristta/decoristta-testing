import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Optimistic check only -- sessions are DB-backed now, so a real check would
// mean a database round-trip on every matched request, which Next's own docs
// advise against doing in Proxy. Every Server Action re-verifies the session
// against the database independently before touching any data (see
// src/lib/session.ts's requireUserId()) -- that's the actual security boundary.
export default function proxy(request: NextRequest) {
  const hasSessionCookie = !!request.cookies.get('session')?.value;

  if (request.nextUrl.pathname.startsWith('/account') || request.nextUrl.pathname.startsWith('/checkout')) {
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/login')) {
    if (hasSessionCookie) {
      // Don't redirect if it's a Server Action POST request (e.g., completeProfile)
      if (request.method === 'POST' && request.headers.has('next-action')) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/account', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/login'],
};
