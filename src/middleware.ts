import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');

  // Protect /account and /checkout routes
  if (request.nextUrl.pathname.startsWith('/account') || request.nextUrl.pathname.startsWith('/checkout')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If user is already logged in, prevent them from accessing /login
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/account', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/login'],
};
