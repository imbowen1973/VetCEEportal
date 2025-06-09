import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const session = await auth();
    
    // Check if user is authenticated and has Provider role
    if (!session || !session.user || !session.user.roles?.includes('Provider')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });
    
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'No organization found for user' }, { status: 400 });
    }
    
    // Create verification token
    const token = crypto.randomUUID();
    const hashedToken = crypto
      .createHash('sha256')
      .update(`${token}${process.env.NEXTAUTH_SECRET}`)
      .digest('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        token: hashedToken,
        expires,
        email,
        role: 'Provider',
        orgId: user.organizationId,
      },
    });
    
    // Send email with verification link
    // This would typically use nodemailer or a similar service
    console.log(`Team invitation link: ${process.env.NEXTAUTH_URL}/auth/register/team?email=${encodeURIComponent(email)}&token=${token}&role=Provider&orgId=${user.organizationId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
