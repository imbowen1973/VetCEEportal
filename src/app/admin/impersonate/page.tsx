'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function AdminImpersonate() {
  const router = useRouter();
  const [userId, setUserId] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<Notification | null>(null);
  
  const handleImpersonate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId.trim()) return;
    
    setIsLoading(true);
    setNotification(null);
    
    try {
      const response = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId: userId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to impersonate user');
      }
      
      const data = await response.json();
      
      setNotification({
        type: 'success',
        message: `Now impersonating ${data.user.name || data.user.email}`
      });
      
      // In a real implementation, this would update the session
      // For now, we'll just redirect to the dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impersonate User</h1>
        <p className="mt-2 text-gray-600">Temporarily assume the identity of another user</p>
      </div>
      
      <div className="max-w-md mx-auto p-6 border rounded-lg bg-white">
        {notification && (
          <div className={`p-4 mb-6 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.message}
          </div>
        )}
        
        <form onSubmit={handleImpersonate}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID to impersonate"
                required
                className="form-input"
              />
            </div>
            
            <p className="text-sm text-gray-600">
              This action will be logged. Use this feature responsibly and only for legitimate administrative purposes.
            </p>
            
            <button
              type="submit"
              className="w-full btn"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Impersonate User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
