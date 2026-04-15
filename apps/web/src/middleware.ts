import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('guru-upadesh-auth')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/reset-password');

  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/interviews') ||
    pathname.startsWith('/questions') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/settings');

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/interviews/:path*',
    '/questions/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/reset-password',
  ],
};
