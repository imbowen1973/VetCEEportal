'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyRequest() {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <h1 className="text-3xl font-bold mb-6">Check your email</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <p className="mb-4">A sign in link has been sent to your email address.</p>
        <p>Please check your inbox and click the link to continue.</p>
      </div>
      <p className="text-sm text-gray-600">
        If you don&apos;t see the email, check your spam folder. If you still don&apos;t see it, try requesting another link.
      </p>
    </div>
  );
}
