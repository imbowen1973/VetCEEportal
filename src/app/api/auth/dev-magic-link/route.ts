import { NextRequest, NextResponse } from 'next/server';
import { getMagicLink } from '@/lib/dev-magic-links';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  const link = getMagicLink(email);
  if (!link) {
    return NextResponse.json({ error: 'Magic link not found' }, { status: 404 });
  }
  return NextResponse.json({ url: link });
}
