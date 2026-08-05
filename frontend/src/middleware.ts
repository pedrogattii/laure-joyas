import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { globalApiRateLimiter, strictAuthRateLimiter } from '@/lib/rateLimiter';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract client IP address or fallback to default client ID
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // Apply strict rate limiting for auth and checkout actions
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/api/auth');
  const isApiRoute = pathname.startsWith('/api/');

  if (isAuthRoute || isApiRoute) {
    const limiter = isAuthRoute ? strictAuthRateLimiter : globalApiRateLimiter;
    const limitMax = isAuthRoute ? 15 : 60;
    const rateCheck = limiter.check(ip, limitMax);

    if (!rateCheck.allowed) {
      const retryAfterSec = Math.ceil(rateCheck.resetMs / 1000);
      return new NextResponse(
        JSON.stringify({
          error: 'Demasiadas solicitudes / Too Many Requests',
          message: `Has excedido el límite de seguridad. Por favor intenta de nuevo en ${retryAfterSec} segundos.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(limitMax),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  // Create response and attach global security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files (_next/static, _next/image, favicon.ico, images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
