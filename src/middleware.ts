import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // D8_TV_BYPASS_FORCE_DEPLOY_011
  if (
    pathname === '/tv' || pathname.startsWith('/tv/') ||
    pathname === '/api/tv' || pathname.startsWith('/api/tv/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Root serves the Builder (AI website generator). All other paths → /io cockpit.
  if (pathname === '/') return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = '/io';
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/:path*',
};
