import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // D8_TV_BYPASS_FORCE_DEPLOY_011
  if (
    pathname === '/tv' || pathname.startsWith('/tv/') || pathname.startsWith('/tv-') ||
    pathname === '/api/tv' || pathname.startsWith('/api/tv/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Default: route everything else to /io (existing architecture)
  const url = request.nextUrl.clone();
  url.pathname = '/io';
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/:path*',
};

