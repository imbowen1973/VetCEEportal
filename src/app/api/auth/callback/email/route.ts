import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decode } from 'next-auth/jwt';

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

/**
 * Custom callback handler for email authentication
 * This provides detailed logging and error handling for the email magic link flow
 */
export async function GET(request: NextRequest) {
  console.log('==========================================');
  console.log('EMAIL CALLBACK HANDLER - DETAILED LOGS');
  console.log('==========================================');
  
  // Get URL parameters
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  let redirectUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  // Get the base URL from environment variable or request
  const baseUrl = process.env.NEXTAUTH_URL || request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = baseUrl.startsWith('https') ? 'https' : 'http';
  const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `${protocol}://${baseUrl}`;
  
  console.log('Request URL:', request.url);
  console.log('Base URL:', fullBaseUrl);
  console.log('Token:', token);
  console.log('Email:', email);
  console.log('Initial redirect URL:', redirectUrl);
  
  try {
    if (!token || !email) {
      console.error('Missing token or email in callback URL');
      return NextResponse.redirect(`${fullBaseUrl}/auth/error?error=MissingParameters`);
    }
    
    // Verify the token exists in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    });
    
    console.log('Verification token from database:', verificationToken);
    
    if (!verificationToken) {
      console.error('Token not found in database');
      return NextResponse.redirect(`${fullBaseUrl}/auth/error?error=InvalidToken`);
    }
    
    // Check if token is expired
    if (new Date(verificationToken.expires) < new Date()) {
      console.error('Token has expired');
      return NextResponse.redirect(`${fullBaseUrl}/auth/error?error=TokenExpired`);
    }
    
    // Check if token matches the email
    if (verificationToken.identifier !== email) {
      console.error('Token does not match email');
      return NextResponse.redirect(`${fullBaseUrl}/auth/error?error=TokenMismatch`);
    }
    
    // Find or create the user
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    
    console.log('User found in database:', user ? 'Yes' : 'No');
    
    // For new users, redirect to registration page only if they're not already on a specific page
    if (!user) {
      // This is a new user, create a basic account
      // They will complete registration after verification
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Temporary name from email
          roles: ['PENDING'], // Default role for new users
          status: 'PENDING', // Default status for new users
        },
      });
      
      console.log('Created new user:', user);
      
      // For new users, only redirect to registration if callback URL is dashboard
      if (redirectUrl === '/dashboard') {
        redirectUrl = '/register';
      }
      // Otherwise, keep the original callback URL to stay on the same page
    }
    
    // Create a session for the user
    const session = await prisma.session.create({
      data: {
        sessionToken: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
    
    console.log('Created session:', session);
    
    // Delete the verification token to prevent reuse
    await prisma.verificationToken.delete({
      where: {
        token,
      },
    });
    
    // Ensure redirectUrl is absolute
    const finalRedirectUrl = redirectUrl.startsWith('http') 
      ? redirectUrl 
      : `${fullBaseUrl}${redirectUrl.startsWith('/') ? '' : '/'}${redirectUrl}`;
    
    console.log('Deleted verification token');
    console.log('Redirecting to:', finalRedirectUrl);
    console.log('==========================================');
    
    // Set cookies and redirect to callback URL
    const response = NextResponse.redirect(finalRedirectUrl);
    
    // Set the session cookie
    response.cookies.set({
      name: 'next-auth.session-token',
      value: session.sessionToken,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('==========================================');
    console.error('EMAIL CALLBACK ERROR - DETAILED LOGS');
    console.error('==========================================');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('==========================================');
    
    // Redirect to error page with details
    return NextResponse.redirect(
      `${fullBaseUrl}/auth/error?error=CallbackError&message=${encodeURIComponent(error.message)}`
    );
  }
}
