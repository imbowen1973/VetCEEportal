// This file is used to handle API routes for profile updates
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has Provider role
    if (!session || !session.user || !session.user.roles.includes('Provider')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, details } = await req.json();
    
    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });
    
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'No organization found for user' }, { status: 400 });
    }
    
    // Update organization
    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        name,
        details,
      },
    });
    
    return NextResponse.json({ 
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
