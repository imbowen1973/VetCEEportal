import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId, roles } = await req.json();
    
    if (!userId || !roles || !Array.isArray(roles)) {
      return NextResponse.json({ error: 'User ID and roles array are required' }, { status: 400 });
    }
    
    const session = await auth();
    
    // Check if user is authenticated and has AdminFull role
    if (!session || !session.user || !session.user.roles.includes('AdminFull')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate roles
    const validRoles = ['Provider', 'Reviewer', 'AdminFull', 'AdminReadOnly'];
    const allRolesValid = roles.every(role => validRoles.includes(role));
    
    if (!allRolesValid) {
      return NextResponse.json({ error: 'Invalid roles provided' }, { status: 400 });
    }
    
    // Update user roles
    await prisma.user.update({
      where: { id: userId },
      data: { roles },
    });
    
    // Log the role update action
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER_ROLES',
        details: `Admin ${session.user.name || session.user.email} updated roles for user ${userId} to ${roles.join(', ')}`,
        userId: session.user.id,
        targetId: userId,
      },
    });
    
    return NextResponse.json({ message: 'User roles updated successfully' });
  } catch (error) {
    console.error('Error updating user roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
