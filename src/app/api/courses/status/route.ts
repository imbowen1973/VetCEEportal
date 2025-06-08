import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.roles?.includes('Provider')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: { userId: session.user.id },
      select: { status: true },
    });

    const statuses = [
      'draft',
      'submitted',
      'awaiting_payment',
      'in_peer_review',
      'awaiting_feedback',
      'approved',
      'scheduling',
      'delivered',
    ] as const;

    const counts: Record<string, number> = {};
    statuses.forEach((s) => {
      counts[s] = courses.filter((c) => c.status === s).length;
    });

    return NextResponse.json({ counts });
  } catch (error) {
    console.error('Error fetching course status counts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
