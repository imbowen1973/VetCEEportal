'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Session {
  title: string;
  teacher: string;
  duration: string;
  description: string;
}

interface FormData {
  title: string;
  description: string;
  outcomes: string;
  qa: string;
  pedagogy: string;
  policies: string;
  teacherBios: string;
  sessions: Session[];
}

export default function Submit() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<FormData>({
    title: '',
    description: '',
    outcomes: '',
    qa: '',
    pedagogy: '',
    policies: '',
    teacherBios: '',
    sessions: [{ title: '', teacher: '', duration: '', description: '' }]
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSessionChange = (index: number, field: keyof Session, value: string) => {
    const updatedSessions = [...formData.sessions];
    updatedSessions[index] = {
      ...updatedSessions[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      sessions: updatedSessions
    }));
  };
  
  const addSession = () => {
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, { title: '', teacher: '', duration: '', description: '' }]
    }));
  };
  
  const removeSession = (index: number) => {
    if (formData.sessions.length <= 1) return;
    
    const updatedSessions = formData.sessions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      sessions: updatedSessions
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit course');
      }
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        outcomes: '',
        qa: '',
        pedagogy: '',
        policies: '',
        teacherBios: '',
        sessions: [{ title: '', teacher: '', duration: '', description: '' }]
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Course</h1>
        <p className="mt-2 text-gray-600">Submit a new course for VetCEE approval</p>
      </div>
      
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          <p className="font-medium">Course submitted successfully!</p>
          <p className="mt-1">Your course has been submitted for review. You will be redirected to your dashboard.</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="p-6 border rounded-lg bg-white">
                <div className="space-y-4">
                  <h2 className="text-xl font-medium">Course Details</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Course Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Enter course title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Course Description</label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Provide a detailed description of the course"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      required
                      className="form-textarea"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Learning Outcomes</label>
                    <textarea
                      id="outcomes"
                      name="outcomes"
                      placeholder="List the learning outcomes for this course"
                      value={formData.outcomes}
                      onChange={handleChange}
                      rows={4}
                      required
                      className="form-textarea"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg bg-white">
                <div className="space-y-4">
                  <h2 className="text-xl font-medium">Course Sessions</h2>
                  
                  {formData.sessions.map((session, index) => (
                    <div key={index} className="p-4 border rounded-md bg-gray-50">
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Session {index + 1}</h3>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Session Title</label>
                          <input
                            type="text"
                            placeholder="Enter session title"
                            value={session.title}
                            onChange={(e) => handleSessionChange(index, 'title', e.target.value)}
                            required
                            className="form-input"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Teacher</label>
                          <input
                            type="text"
                            placeholder="Enter teacher name"
                            value={session.teacher}
                            onChange={(e) => handleSessionChange(index, 'teacher', e.target.value)}
                            required
                            className="form-input"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                          <input
                            type="number"
                            placeholder="Enter duration in minutes"
                            value={session.duration}
                            onChange={(e) => handleSessionChange(index, 'duration', e.target.value)}
                            required
                            className="form-input"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Session Description</label>
                          <textarea
                            placeholder="Describe this session"
                            value={session.description}
                            onChange={(e) => handleSessionChange(index, 'description', e.target.value)}
                            rows={3}
                            className="form-textarea"
                          />
                        </div>
                        
                        {formData.sessions.length > 1 && (
                          <button 
                            type="button"
                            className="text-sm text-red-600 hover:text-red-800"
                            onClick={() => removeSession(index)}
                          >
                            Remove Session
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button"
                    className="text-sm flex items-center text-brand-500 hover:text-brand-600"
                    onClick={addSession}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Session
                  </button>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg bg-white">
                <div className="space-y-4">
                  <h2 className="text-xl font-medium">Additional Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Quality Assurance</label>
                    <textarea
                      id="qa"
                      name="qa"
                      placeholder="Describe quality assurance measures"
                      value={formData.qa}
                      onChange={handleChange}
                      rows={3}
                      className="form-textarea"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Pedagogical Approach</label>
                    <textarea
                      id="pedagogy"
                      name="pedagogy"
                      placeholder="Describe your teaching methodology"
                      value={formData.pedagogy}
                      onChange={handleChange}
                      rows={3}
                      className="form-textarea"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Policies</label>
                    <textarea
                      id="policies"
                      name="policies"
                      placeholder="Describe relevant policies (e.g., attendance, assessment)"
                      value={formData.policies}
                      onChange={handleChange}
                      rows={3}
                      className="form-textarea"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Teacher Biographies</label>
                    <textarea
                      id="teacherBios"
                      name="teacherBios"
                      placeholder="Provide short biographies of the teachers"
                      value={formData.teacherBios}
                      onChange={handleChange}
                      rows={3}
                      className="form-textarea"
                    />
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                  {error}
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full btn py-3 text-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Course for Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
