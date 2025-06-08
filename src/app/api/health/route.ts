import { NextResponse } from 'next/server';

// This file is used to fix the module resolution issues
export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({ message: 'API is working' });
}
