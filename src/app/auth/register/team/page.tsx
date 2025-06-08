'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface TeamMember {
  name: string;
  email: string;
  role: string;
}

interface FormData {
  teamMembers: TeamMember[];
}

export default function RegisterTeam() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<FormData>({
    teamMembers: [{ name: '', email: '', role: '' }]
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Load data from previous steps
  React.useEffect(() => {
    const personalData = localStorage.getItem('registerPersonal');
    const businessData = localStorage.getItem('registerBusiness');
    
    if (!personalData || !businessData) {
      router.push('/auth/register/personal');
    }
  }, [router]);
  
  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...formData.teamMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      teamMembers: updatedMembers
    }));
  };
  
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', email: '', role: '' }]
    }));
  };
  
  const removeTeamMember = (index: number) => {
    if (formData.teamMembers.length <= 1) return;
    
    const updatedMembers = formData.teamMembers.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      teamMembers: updatedMembers
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would send all data to the server
      const personalData = JSON.parse(localStorage.getItem('registerPersonal') || '{}');
      const businessData = JSON.parse(localStorage.getItem('registerBusiness') || '{}');
      
      const completeData = {
        ...personalData,
        organization: businessData,
        team: formData.teamMembers
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear localStorage
      localStorage.removeItem('registerPersonal');
      localStorage.removeItem('registerBusiness');
      
      // Navigate to success page or dashboard
      router.push('/auth/verify-request');
    } catch (error: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Team Information</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add team members who will have access to your organization's account. You can invite more team members later.
            </p>
            
            {formData.teamMembers.map((member, index) => (
              <div key={index} className="p-4 border rounded-md bg-gray-50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Team Member {index + 1}</h3>
                    {formData.teamMembers.length > 1 && (
                      <button 
                        type="button"
                        className="text-sm text-red-600 hover:text-red-800"
                        onClick={() => removeTeamMember(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                      placeholder="e.g., Administrator, Content Manager"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button"
              className="text-sm flex items-center text-brand-500 hover:text-brand-600"
              onClick={addTeamMember}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Team Member
            </button>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
                {error}
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                type="button"
                className="btn-outline"
                onClick={() => router.push('/auth/register/business')}
              >
                Back
              </button>
              
              <button
                type="submit"
                className="btn"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
