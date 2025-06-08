'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // If user is already authenticated, redirect to dashboard
      router.replace('/dashboard');
    } else if (status === 'unauthenticated') {
      // If not authenticated, redirect to home page for login
      router.replace('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Registration</h2>
        <p className="mb-6">Redirecting you to the appropriate page...</p>
      </div>
    </div>
  );
}

