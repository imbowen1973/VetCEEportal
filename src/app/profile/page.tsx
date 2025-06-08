'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import { useSession } from 'next-auth/react';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  roles?: string[];
}

interface Organization {
  id: string;
  name: string;
  details?: string;
}

interface FormData {
  name: string;
  details: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

// Create a client-side only component that uses useSession
function ProfileContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    details: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<Notification | null>(null);
  
  React.useEffect(() => {
    // Fetch organization data when component mounts
    const fetchOrganization = async () => {
      if (user?.organizationId) {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const data = await response.json();
            setOrganization(data.organization);
            setFormData({
              name: data.organization?.name || '',
              details: data.organization?.details || '',
            });
          }
        } catch (error) {
          console.error('Error fetching organization:', error);
        }
      }
    };
    
    fetchOrganization();
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      setNotification({
        type: 'success',
        message: 'Your organization profile has been updated successfully.'
      });
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while updating profile'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="mt-4">Please sign in to access your profile.</p>
      </div>
    );
  }
  
  if (!organization) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold">Organization Not Found</h1>
        <p className="mt-4">You are not associated with any organization.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Profile</h1>
        <p className="mt-2 text-gray-600">Update your organization details</p>
      </div>
      
      <div className="max-w-lg mx-auto p-6 border rounded-lg bg-white">
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
              <label className="block text-sm font-medium mb-1">Organization Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter organization name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Organization Details</label>
              <textarea
                id="details"
                name="details"
                placeholder="Provide details about your organization"
                value={formData.details}
                onChange={handleChange}
                rows={6}
                className="form-textarea"
              />
            </div>
            
            <button
              type="submit"
              className="w-full btn"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main page component that doesn't use any client hooks during SSR
export default function Profile() {
  return (
    <ClientOnly>
      <ProfileContent />
    </ClientOnly>
  );
}
