// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    alert('hi');
  const { pathname } = req.nextUrl;

  // List of restricted paths
  const restrictedPaths = [
    '/dashboard',
    '/add-keyword',
    '/keyword-analysis',
    '/schedule',
    '/admin/data-sources/weight-management',
    '/admin/data-sources',
  ];

  const isRestrictedPath = restrictedPaths.some((path) => pathname.startsWith(path));

  // If the path is restricted, check the session cookie
  if (isRestrictedPath) {
    // Look for the Auth0 session cookie (`appSession` is the default name)
    const token = req.cookies.get('appSession');

    // If there's no session cookie, redirect to login
    if (!token) {
      const loginUrl = new URL('/api/auth/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Specify the paths for which the middleware should run
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/add-keyword',
    '/keyword-analysis',
    '/schedule',
    '/admin/data-sources/:path*',
  ],
};
