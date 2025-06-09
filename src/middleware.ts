import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Configure CORS middleware for API routes
export async function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '';
  
  // Only apply CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Create a new response
    const response = NextResponse.next();

    // Check user status for protected routes (exclude NextAuth routes)
    if (!request.nextUrl.pathname.startsWith('/api/auth')) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!token || token.status !== 'approved') {
        return NextResponse.json({ error: 'User not approved' }, { status: 403 });
      }
    }
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }
    
    return response;
  }
  
  return NextResponse.next();
}

// Configure middleware to run only on API routes
export const config = {
  matcher: '/api/:path*',
};
