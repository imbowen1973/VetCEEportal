import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, confirmEmail, role, adminInitiated, invitedBy, orgId } = await req.json();
    
    // Validate required fields
    if (!email || !confirmEmail) {
      return NextResponse.json({ error: 'Email and confirmation are required' }, { status: 400 });
    }
    
    if (email !== confirmEmail) {
      return NextResponse.json({ error: 'Emails do not match' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Check for existing active tokens
    const existingToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        status: 'active',
        expires: { gt: new Date() }
      }
    });
    
    if (existingToken) {
      return NextResponse.json({ error: 'A verification link has already been sent to this email' }, { status: 400 });
    }
    
    // Authorization checks
    const session = await auth();
    
    // If admin initiated, check if admin is authenticated
    if (adminInitiated) {
      if (!session?.user?.roles?.includes('AdminFull')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    // If team invitation, check if user is Provider with organization
    if (invitedBy) {
      if (!session?.user?.roles?.includes('Provider') || !session?.user?.organizationId) {
        return NextResponse.json({ error: 'Only Providers with organizations can invite team members' }, { status: 401 });
      }
      
      // Use the inviter's organization ID if not provided
      if (!orgId) {
        orgId = session.user.organizationId;
      }
    }
    
    // Validate role
    const validRoles = ['Provider', 'Reviewer', 'AdminReadOnly', 'AdminFull'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // Create verification token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await prisma.verificationToken.create({
      data: {
        token,
        expires,
        email,
        status: 'active',
        role: role || 'Provider',
        orgId: orgId || null,
        invitedBy: invitedBy || null,
        adminInitiated: adminInitiated || false
      },
    });
    
    // Determine registration page based on role and invitation status
    let registrationPage;
    if (invitedBy) {
      registrationPage = 'team';
    } else if (role === 'Provider') {
      registrationPage = 'business';
    } else {
      registrationPage = 'personal';
    }
    
    // Build registration link
    const registrationLink = `${process.env.NEXTAUTH_URL}/auth/register/${registrationPage}?email=${encodeURIComponent(email)}&token=${token}`;
    
    // Add additional query parameters if needed
    const queryParams = [];
    if (role) queryParams.push(`role=${role}`);
    if (orgId) queryParams.push(`orgId=${orgId}`);
    if (invitedBy) queryParams.push(`invitedBy=${invitedBy}`);
    if (adminInitiated) queryParams.push(`adminInitiated=true`);
    
    const fullRegistrationLink = queryParams.length > 0 
      ? `${registrationLink}&${queryParams.join('&')}` 
      : registrationLink;
    
    // Send email with verification link
    // This would typically use nodemailer or a similar service
    console.log(`Registration link: ${fullRegistrationLink}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Verification link sent',
      registrationType: invitedBy ? 'team' : (role === 'Provider' ? 'business' : 'personal')
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
