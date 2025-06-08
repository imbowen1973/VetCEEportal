// This file is used to handle API routes for course reviews
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has Reviewer role
    if (!session || !session.user || !session.user.roles.includes('Reviewer')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { courseId, status, comment } = await req.json();
    
    // Validate required fields
    if (!courseId || !status || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Create review
    await prisma.courseReview.create({
      data: {
        comment,
        status,
        courseId,
      },
    });
    
    // Update course status
    await prisma.course.update({
      where: { id: courseId },
      data: { status },
    });
    
    return NextResponse.json({ 
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
