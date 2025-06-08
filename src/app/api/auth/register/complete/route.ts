import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

interface RegistrationData {
  email: string;
  token: string;
  name: string;
  orgName?: string;
  orgDetails?: string;
  role?: string;
  orgId?: string;
  invitedBy?: string;
  adminInitiated?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { 
      email, 
      token, 
      name, 
      orgName, 
      orgDetails, 
      role, 
      orgId,
      invitedBy,
      adminInitiated
    } = await req.json() as RegistrationData;
    
    // Validate required fields
    if (!email || !token || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        token,
        status: 'active',
        expires: {
          gt: new Date(),
        },
      },
    });
    
    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Determine if user should be auto-approved
    let status = 'pending';
    
    // Auto-approve in these cases:
    // 1. Team members joining an existing organization
    // 2. Admin users created by AdminFull
    // 3. Users explicitly marked for auto-approval
    if (
      (orgId && verificationToken.invitedBy) || // Team invitation
      (verificationToken.adminInitiated && (verificationToken.role === 'AdminFull' || verificationToken.role === 'AdminReadOnly')) || // Admin creation
      (adminInitiated && (role === 'AdminFull' || role === 'AdminReadOnly')) // Admin creation via form
    ) {
      status = 'approved';
    }
    
    // Create user
    const userData: any = {
      name,
      email,
      roles: [role || verificationToken.role || 'Provider'],
      status,
    };
    
    // Handle organization
    if (orgName && (role === 'Provider' || verificationToken.role === 'Provider')) {
      // Create new organization
      const organization = await prisma.organization.create({
        data: {
          name: orgName,
          details: orgDetails || '',
        },
      });
      
      // Add organization ID to user data
      userData.organizationId = organization.id;
    } else if (orgId || verificationToken.orgId) {
      // Use existing organization ID
      userData.organizationId = orgId || verificationToken.orgId;
    }
    
    // Create user
    const user = await prisma.user.create({
      data: userData,
    });
    
    // Mark token as used
    await prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: { status: 'used' },
    });
    
    // Log audit if this was an admin-initiated registration
    if (verificationToken.adminInitiated || adminInitiated) {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_USER',
          details: `Admin created user ${email} with roles ${userData.roles.join(', ')}`,
          userId: verificationToken.invitedBy || null,
          targetId: user.id,
        },
      });
    }
    
    // If this was a team invitation, log it
    if (verificationToken.invitedBy) {
      await prisma.auditLog.create({
        data: {
          action: 'INVITE_TEAM_MEMBER',
          details: `User ${email} joined organization via invitation`,
          userId: verificationToken.invitedBy,
          targetId: user.id,
        },
      });
    }
    
    return NextResponse.json({ 
      success: true,
      status: user.status,
      message: status === 'approved' 
        ? 'Registration complete. You can now sign in.' 
        : 'Registration complete. Your account is pending approval.'
    });
  } catch (error) {
    console.error('Error completing registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
