'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function Invite() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<Notification | null>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);
    
    try {
      const response = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }
      
      setNotification({
        type: 'success',
        message: `An invitation has been sent to ${email}`
      });
      
      // Reset form
      setEmail('');
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while sending invitation'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invite Team Member</h1>
        <p className="mt-2 text-gray-600">Invite colleagues to join your organization</p>
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
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter colleague's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <p className="text-sm text-gray-600">
              Your colleague will receive an email with instructions to join your organization.
              They will have access to your organization's courses and be able to submit new courses.
            </p>
            
            <button
              type="submit"
              className="w-full btn"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
