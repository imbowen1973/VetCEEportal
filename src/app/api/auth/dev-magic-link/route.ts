import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      email,
      status: 'active',
      expires: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!tokenRecord) {
    return NextResponse.json({ error: 'Magic link not found' }, { status: 404 });
  }

  const baseUrl = process.env.NEXTAUTH_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: 'NEXTAUTH_URL not configured' }, { status: 500 });
  }

  const link = `${baseUrl}/api/auth/callback/email?token=${tokenRecord.token}&email=${encodeURIComponent(email)}`;

  return NextResponse.json({ url: link });
}
