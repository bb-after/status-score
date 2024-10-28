// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define paths that are public
  const publicPaths = ['/', '/api/auth/login', '/api/auth/callback'];

  // Check if user has an authenticated session by looking for the 'auth0' cookie
  const token = req.cookies.get('auth0.is.authenticated');

  // If the request is for a public path, proceed without any checks
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // If it's a restricted page and the user is not authenticated, redirect to login
  if (!token || token.value !== 'true') {
    const loginUrl = new URL('/api/auth/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/add-keyword',
    '/keyword-analysis',
    '/schedule',
    '/admin/data-sources/:path*',
    '/teams/:path*',
  ],
};
