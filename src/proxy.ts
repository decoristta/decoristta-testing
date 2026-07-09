import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Proxy runs on the Node.js runtime in this Next.js version, so we can afford a
// real (cryptographic) check here instead of just testing for cookie presence.
// This is still only an "optimistic" check for fast redirects -- every Server
// Action/DAL call re-verifies the session independently before touching data.
async function isValidSession(request: NextRequest): Promise<boolean> {
  const session = request.cookies.get('session')?.value;
  if (!session) return false;

  try {
    const { adminAuth } = await import('@/lib/firebase/admin');
    if (!adminAuth) return false;
    await adminAuth.verifySessionCookie(session);
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const authenticated = await isValidSession(request);

  // Protect /account and /checkout routes
  if (request.nextUrl.pathname.startsWith('/account') || request.nextUrl.pathname.startsWith('/checkout')) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If user is already logged in, prevent them from accessing /login
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (authenticated) {
      return NextResponse.redirect(new URL('/account', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/login'],
};
