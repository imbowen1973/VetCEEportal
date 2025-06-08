'use client';

import React from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  organization?: {
    name: string;
  };
  sessions?: Array<{
    id: string;
    title: string;
  }>;
}

export default function Courses() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Fetch courses data
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="mt-2 text-gray-600">Browse available courses</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading courses...</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p>No courses found.</p>
        </div>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium">{course.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          course.status === 'approved' ? 'bg-green-100 text-green-800' : 
          course.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
        </span>
      </div>
      
      <p className="text-sm text-gray-500 mt-1">
        {course.organization?.name || 'Unknown organization'}
      </p>
      
      <p className="mt-3 text-sm line-clamp-3">{course.description}</p>
      
      {course.sessions && course.sessions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium">Sessions: {course.sessions.length}</p>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <Link href={`/courses/${course.id}`} className="text-sm text-brand-500 hover:text-brand-600">
          View Details →
        </Link>
      </div>
    </div>
  );
}
