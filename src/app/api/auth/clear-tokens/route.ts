'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to perform this action' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    const userRoles = session.user.roles || [];
    if (!userRoles.includes('AdminFull')) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to perform this action' },
        { status: 403 }
      );
    }
    
    // Delete all verification tokens
    await prisma.verificationToken.deleteMany({});
    
    // Delete all sessions except the current one
    const currentSessionToken = req.cookies.get('next-auth.session-token')?.value;
    if (currentSessionToken) {
      await prisma.session.deleteMany({
        where: {
          sessionToken: {
            not: currentSessionToken
          }
        }
      });
    } else {
      // If no current session token found, delete all sessions
      await prisma.session.deleteMany({});
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'All tokens cleared successfully. Users will need to re-authenticate.' 
    });
  } catch (error) {
    console.error('Error clearing tokens:', error);
    return NextResponse.json(
      { error: 'Failed to clear tokens', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
