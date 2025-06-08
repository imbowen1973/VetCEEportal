'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  organizationName: string;
  organizationType: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  website: string;
}

export default function RegisterBusiness() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<FormData>({
    organizationName: '',
    organizationType: 'university',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    website: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Load personal data from previous step
  React.useEffect(() => {
    const personalData = localStorage.getItem('registerPersonal');
    if (!personalData) {
      router.push('/auth/register/personal');
    }
  }, [router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would send the data to the server
      // For now, we'll just simulate a delay and move to the next step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store data in localStorage for the next step
      localStorage.setItem('registerBusiness', JSON.stringify(formData));
      
      // Navigate to the next step
      router.push('/auth/register/team');
    } catch (error: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Business Information</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Organization Name</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Organization Type</label>
              <select
                name="organizationType"
                value={formData.organizationType}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="association">Professional Association</option>
                <option value="company">Company</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select a country</option>
                <option value="AT">Austria</option>
                <option value="BE">Belgium</option>
                <option value="BG">Bulgaria</option>
                <option value="HR">Croatia</option>
                <option value="CY">Cyprus</option>
                <option value="CZ">Czech Republic</option>
                <option value="DK">Denmark</option>
                <option value="EE">Estonia</option>
                <option value="FI">Finland</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="GR">Greece</option>
                <option value="HU">Hungary</option>
                <option value="IE">Ireland</option>
                <option value="IT">Italy</option>
                <option value="LV">Latvia</option>
                <option value="LT">Lithuania</option>
                <option value="LU">Luxembourg</option>
                <option value="MT">Malta</option>
                <option value="NL">Netherlands</option>
                <option value="PL">Poland</option>
                <option value="PT">Portugal</option>
                <option value="RO">Romania</option>
                <option value="SK">Slovakia</option>
                <option value="SI">Slovenia</option>
                <option value="ES">Spain</option>
                <option value="SE">Sweden</option>
                <option value="GB">United Kingdom</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://"
                className="form-input"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
                {error}
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                type="button"
                className="btn-outline"
                onClick={() => router.push('/auth/register/personal')}
              >
                Back
              </button>
              
              <button
                type="submit"
                className="btn"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Next: Team Information'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
