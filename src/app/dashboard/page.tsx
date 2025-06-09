// Create: app/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('🔐 [DASHBOARD] Session status:', status)
    console.log('🔐 [DASHBOARD] Session data:', session)
    console.log('🔐 [DASHBOARD] User roles:', session?.user?.roles)
    console.log('🔐 [DASHBOARD] Cookies:', document.cookie)
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be signed in to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Welcome to VetCEE Portal Dashboard
              </h1>
              
              {session?.user && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <h2 className="text-lg font-medium text-blue-900 mb-2">
                    Signed in as: {session.user.email}
                  </h2>
                  <div className="text-sm text-blue-700">
                    <p><strong>Name:</strong> {session.user.name || 'Not set'}</p>
                    <p><strong>Roles:</strong> {session.user.roles?.join(', ') || 'No roles'}</p>
                    <p><strong>Status:</strong> {session.user.status || 'Unknown'}</p>
                    {session.user.organizationId && (
                      <p><strong>Organization ID:</strong> {session.user.organizationId}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Courses
                  </h3>
                  <p className="text-gray-600">
                    Manage your veterinary continuing education courses.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Reviews
                  </h3>
                  <p className="text-gray-600">
                    Review and approve course submissions.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Profile
                  </h3>
                  <p className="text-gray-600">
                    Update your profile and organization details.
                  </p>
                </div>
              </div>

              {/* Debug info */}
              <details className="mt-8">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Debug: Session Information
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify({ session, status }, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}