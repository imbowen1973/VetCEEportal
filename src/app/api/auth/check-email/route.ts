import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Rate limiting storage
const rateLimitStore: Record<string, { attempts: number, lastReset: number }> = {};

// Clean up rate limit entries older than 10 minutes
const cleanupRateLimits = () => {
  const now = Date.now();
  const tenMinutesMs = 10 * 60 * 1000;

  Object.keys(rateLimitStore).forEach(email => {
    if (now - rateLimitStore[email].lastReset > tenMinutesMs) {
      delete rateLimitStore[email];
    }
  });
};

export async function POST(request: NextRequest) {
  try {
    // Clean up old rate limit entries
    cleanupRateLimits();

    // Parse request body
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required',
        exists: false 
      }, { status: 400 });
    }

    // Check rate limiting
    if (!rateLimitStore[email]) {
      rateLimitStore[email] = { attempts: 0, lastReset: Date.now() };
    }

    // Reset counter if it's been more than 10 minutes
    const now = Date.now();
    if (now - rateLimitStore[email].lastReset > 10 * 60 * 1000) {
      rateLimitStore[email] = { attempts: 0, lastReset: now };
    }

    // Increment attempt counter
    rateLimitStore[email].attempts += 1;

    // Check if rate limited
    if (rateLimitStore[email].attempts > 3) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          resetIn: Math.ceil((rateLimitStore[email].lastReset + 10 * 60 * 1000 - now) / 1000) 
        }, 
        { status: 429 }
      );
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      select: { id: true, email: true, roles: true }
    });

    // Log the check for debugging
    console.log(`Email check for ${email}: ${user ? 'Found' : 'Not found'}`);

    return NextResponse.json({ 
      exists: !!user,
      roles: user?.roles || [],
      attempts: rateLimitStore[email].attempts,
      remaining: Math.max(0, 3 - rateLimitStore[email].attempts)
    });

  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      exists: false 
    }, { status: 500 });
  }
}