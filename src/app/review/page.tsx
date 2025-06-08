'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  title: string;
  description: string;
  outcomes: string;
  qa?: string;
  pedagogy?: string;
  createdAt: string;
  organization?: {
    name: string;
  };
  user?: {
    name?: string;
    email?: string;
  };
  sessions?: Session[];
}

interface Session {
  id: string;
  title: string;
  teacher: string;
  duration: string | number;
  description?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function Review() {
  const [pendingCourses, setPendingCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchPendingCourses = async () => {
      try {
        const response = await fetch('/api/courses/review');
        if (response.ok) {
          const data = await response.json();
          setPendingCourses(data.courses || []);
        }
      } catch (error) {
        console.error('Error fetching pending courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingCourses();
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Courses</h1>
        <p className="mt-2 text-gray-600">Evaluate pending course submissions</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading courses...</p>
        </div>
      ) : pendingCourses.length > 0 ? (
        <ReviewTable courses={pendingCourses} />
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p>No pending courses to review.</p>
        </div>
      )}
    </div>
  );
}

interface ReviewTableProps {
  courses: Course[];
}

function ReviewTable({ courses }: ReviewTableProps) {
  const [expandedCourse, setExpandedCourse] = React.useState<string | null>(null);
  const [comment, setComment] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<Notification | null>(null);
  const router = useRouter();
  
  const handleExpand = (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      setComment('');
    }
  };
  
  const handleReview = async (courseId: string, status: string) => {
    if (!comment.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide a comment with your decision.'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/courses/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          status,
          comment,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }
      
      setNotification({
        type: 'success',
        message: `Course has been ${status}.`
      });
      
      // Remove the course from the list
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred during review'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {notification && (
        <div className={`p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <React.Fragment key={course.id}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{course.organization?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{course.user?.name || course.user?.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(course.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className="text-sm btn-sm btn-outline"
                      onClick={() => handleExpand(course.id)}
                    >
                      {expandedCourse === course.id ? 'Hide Details' : 'Review'}
                    </button>
                  </td>
                </tr>
                {expandedCourse === course.id && (
                  <tr>
                    <td colSpan={5}>
                      <div className="p-4 bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium">Description</h3>
                            <p className="mt-1">{course.description}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium">Learning Outcomes</h3>
                            <p className="mt-1">{course.outcomes}</p>
                          </div>
                          
                          {course.sessions && course.sessions.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium">Sessions ({course.sessions.length})</h3>
                              <div className="mt-2 space-y-2">
                                {course.sessions.map((session, index) => (
                                  <div key={session.id} className="p-2 bg-white rounded border">
                                    <p className="font-medium">{session.title}</p>
                                    <p className="text-sm">Teacher: {session.teacher}</p>
                                    <p className="text-sm">Duration: {session.duration} minutes</p>
                                    {session.description && (
                                      <p className="text-sm mt-1">{session.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {course.qa && (
                            <div>
                              <h3 className="text-sm font-medium">Quality Assurance</h3>
                              <p className="mt-1">{course.qa}</p>
                            </div>
                          )}
                          
                          {course.pedagogy && (
                            <div>
                              <h3 className="text-sm font-medium">Pedagogical Approach</h3>
                              <p className="mt-1">{course.pedagogy}</p>
                            </div>
                          )}
                          
                          <div>
                            <h3 className="text-sm font-medium">Review Comment</h3>
                            <textarea
                              className="mt-1 form-textarea"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Enter your review comments here..."
                              rows={4}
                            />
                          </div>
                          
                          <div className="flex justify-between">
                            <button
                              className="btn-sm bg-green-600 hover:bg-green-700 text-white"
                              disabled={isLoading}
                              onClick={() => handleReview(course.id, 'approved')}
                            >
                              {isLoading ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              className="btn-sm bg-red-600 hover:bg-red-700 text-white"
                              disabled={isLoading}
                              onClick={() => handleReview(course.id, 'rejected')}
                            >
                              {isLoading ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
