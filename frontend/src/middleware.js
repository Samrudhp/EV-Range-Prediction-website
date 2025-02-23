import { NextResponse } from 'next/server';

const publicRoutes = ['/login', '/register', '/', '/favicon.ico'];
const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  
  // Handle API routes
  if (pathname.startsWith('/api')) {
    // Allow public API routes
    if (publicApiRoutes.includes(pathname)) {
      return NextResponse.next();
    }
    // Check token for protected API routes
    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Not authorized, no token' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.next();
  }

  // Handle page routes
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected route without token
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from public routes
  if (token && isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/:path*'
  ],
};