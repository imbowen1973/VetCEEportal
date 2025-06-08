import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { targetUserId } = await req.json();
    
    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }
    
    const session = await auth();
    
    // Check if user is authenticated and has AdminFull role
    if (!session || !session.user || !session.user.roles.includes('AdminFull')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { organization: true },
    });
    
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }
    
    // Create impersonation session
    // In a real implementation, this would create a special session or token
    // For now, we'll just return the target user's details
    
    // Log the impersonation action
    await prisma.auditLog.create({
      data: {
        action: 'IMPERSONATE_USER',
        details: `Admin ${session.user.name || session.user.email} impersonated user ${targetUser.email}`,
        userId: session.user.id,
        targetId: targetUser.id,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        roles: targetUser.roles,
        organizationId: targetUser.organizationId,
      }
    });
  } catch (error) {
    console.error('Error impersonating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
