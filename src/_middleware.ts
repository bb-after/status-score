// middleware.ts
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const session = await getSession(req, NextResponse.next());
  alert('hi');
  const { pathname } = req.nextUrl;

  // Check if user is trying to access a restricted page
  const restrictedPaths = [
    '/dashboard',
    '/add-keyword',
    '/keyword-analysis',
    '/schedule',
    '/admin/data-sources/weight-management',
    '/admin/data-sources',
  ];

  const isRestrictedPath = restrictedPaths.some((path) => pathname.startsWith(path));

  // If it's a restricted page and there's no session, redirect to login
  if (isRestrictedPath && !session) {
    const loginUrl = new URL('/', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Specify the paths for which the middleware should run
export const config = {
  matcher: ['/dashboard/:path*', '/add-keyword', '/keyword-analysis', '/schedule', '/admin/data-sources/:path*'],
};
