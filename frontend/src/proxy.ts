// Protects command-center routes: without the demo sign-in cookie, send people to /login.
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.cookies.get('aero_session')?.value) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/dashboard', '/missions/:path*', '/live', '/analytics', '/sites/:path*', '/fleet/:path*', '/mission-planner', '/reports', '/settings/:path*', '/audit-log'],
};
