import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has Admin role
    if (!session?.user?.roles?.some(role => ['AdminFull', 'AdminReadOnly'].includes(role))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get expired tokens
    const tokens = await prisma.verificationToken.findMany({
      where: {
        OR: [
          { expires: { lt: new Date() } },
          { status: { in: ['used', 'expired'] } }
        ]
      },
      orderBy: {
        expires: 'desc'
      }
    });
    
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('id');
    
    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }
    
    const session = await auth();
    
    // Check if user is authenticated and has AdminFull role
    if (!session?.user?.roles?.includes('AdminFull')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete token
    await prisma.verificationToken.delete({
      where: { id: tokenId }
    });
    
    // Log the deletion action
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_TOKEN',
        details: `Admin ${session.user.name || session.user.email} deleted token ${tokenId}`,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json({ message: 'Token deleted successfully' });
  } catch (error) {
    console.error('Error deleting token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
