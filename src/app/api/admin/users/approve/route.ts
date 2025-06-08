import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const session = await auth();
    
    // Check if user is authenticated and has AdminFull role
    if (!session || !session.user || !session.user.roles.includes('AdminFull')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Update user status to approved
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'approved' },
    });
    
    // Log the approval action
    await prisma.auditLog.create({
      data: {
        action: 'APPROVE_USER',
        details: `Admin ${session.user.name || session.user.email} approved user ${userId}`,
        userId: session.user.id,
        targetId: userId,
      },
    });
    
    return NextResponse.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
