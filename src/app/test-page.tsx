'use client'

import React from 'react'

export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Static Test Page
        </h1>
        <p className="mt-2 text-center text-gray-600">
          This is a simple static page without any authentication logic to test basic routing and rendering.
        </p>
        <div className="mt-6">
          <div className="rounded-md shadow">
            <button
              onClick={() => alert('Button clicked!')}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Test Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
