'use client';

import React from 'react';
import Link from 'next/link';

interface Module {
  id: string;
  title: string;
  description: string;
  outcomes: string;
  status: string;
  organization?: {
    name: string;
  };
  sessions?: Session[];
}

interface Session {
  id: string;
  title: string;
  teacher: string;
  duration: number;
}

export default function Modules() {
  const [modules, setModules] = React.useState<Module[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Fetch modules data
    const fetchModules = async () => {
      try {
        const response = await fetch('/api/modules');
        if (response.ok) {
          const data = await response.json();
          setModules(data.modules || []);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModules();
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modules</h1>
        <p className="mt-2 text-gray-600">Browse available modules</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading modules...</p>
        </div>
      ) : modules.length > 0 ? (
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleAccordion key={module.id} module={module} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p>No modules found.</p>
        </div>
      )}
    </div>
  );
}

interface ModuleAccordionProps {
  module: Module;
}

function ModuleAccordion({ module }: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
          <h3 className="font-medium">{module.title}</h3>
          <p className="text-sm text-gray-600">
            {module.organization?.name || 'Unknown organization'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            module.status === 'approved' ? 'bg-green-100 text-green-800' : 
            module.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
          </span>
          <svg 
            className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Description</h4>
              <p className="mt-1">{module.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium">Learning Outcomes</h4>
              <p className="mt-1">{module.outcomes}</p>
            </div>
            
            {module.sessions && module.sessions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Sessions</h4>
                <div className="space-y-2">
                  {module.sessions.map((session) => (
                    <div key={session.id} className="p-3 bg-white rounded border">
                      <h5 className="font-medium">{session.title}</h5>
                      <p className="text-sm">Teacher: {session.teacher}</p>
                      <p className="text-sm">Duration: {session.duration} minutes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Link href={`/modules/${module.id}`} className="btn-sm btn-outline">
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
