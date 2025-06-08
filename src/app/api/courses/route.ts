// This file is used to handle API routes for courses
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface Session {
  title: string;
  teacher: string;
  duration: string | number;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has Provider role
    if (!session || !session.user || !session.user.roles?.includes('Provider')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
  const {
    title,
    description,
    outcomes,
    qa,
    pedagogy,
    policies,
    teacherBios,
    courseType,
    deliveryType,
    species,
    subject,
    frequency,
    language,
    summary,
    audience,
    locationType,
    locationDetails,
    prerequisites,
    hoursLecture,
    hoursPractical,
    hoursOnline,
    ects,
    cost,
    status,
    sessions
  } = await req.json();
    
    // Validate required fields
    if (!title || !description || !outcomes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });
    
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'No organization found for user' }, { status: 400 });
    }
    
    // Create course
  const course = await prisma.course.create({
    data: {
      title,
      description,
      outcomes,
      qa,
      pedagogy,
      policies,
      teacherBios,
      courseType,
      deliveryType,
      species,
      subject,
      frequency,
      language,
      summary,
      audience,
      locationType,
      locationDetails,
      prerequisites,
      hoursLecture: hoursLecture ? parseFloat(hoursLecture) : undefined,
      hoursPractical: hoursPractical ? parseFloat(hoursPractical) : undefined,
      hoursOnline: hoursOnline ? parseFloat(hoursOnline) : undefined,
      ects: ects ? parseFloat(ects) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
      status: status ?? 'draft',
      userId: session.user.id,
      organizationId: user.organizationId,
      sessions: {
        create: (sessions || []).map((session: Session) => ({
          title: session.title,
          teacher: session.teacher,
          duration: parseInt(session.duration.toString()),
          description: session.description,
        })),
      },
    },
  });
    
    return NextResponse.json({ 
      message: 'Course created successfully',
      courseId: course.id
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
