'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import BiCard from '@/components/dashboard/BiCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { FiUsers, FiFileText, FiDollarSign, FiCheckSquare, FiBook, FiSettings } from 'react-icons/fi';

interface CMSCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const CMSCard: React.FC<CMSCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <div 
      className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gray-800 rounded-md p-3 text-white">
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CMSIntegration() {
  const { data: session } = useSession();
  const userRole = session?.user?.roles || ['PENDING'];
  const isFullAdmin = userRole.includes('AdminFull');

  if (!isFullAdmin) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 bg-gray-800 text-white">
          <h3 className="text-lg font-medium">Content Management System</h3>
          <p className="mt-1 text-sm">Access restricted</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500 mb-4">
            You do not have permission to access the CMS. Please contact an administrator if you need access.
          </p>
        </div>
      </div>
    );
  }

  const handleCMSAccess = (section: string) => {
    window.open(`/cms/${section}`, '_blank');
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:px-6 bg-gray-800 text-white">
        <h3 className="text-lg font-medium">Content Management System</h3>
        <p className="mt-1 text-sm">Manage website content and settings</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <p className="text-sm text-gray-500 mb-6">
          Use the CMS to update website content, manage pages, and publish new information.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <CMSCard 
            title="Pages" 
            description="Edit website pages and content" 
            icon={<FiFileText />} 
            onClick={() => handleCMSAccess('pages')}
          />
          <CMSCard 
            title="Media" 
            description="Manage images and documents" 
            icon={<FiBook />} 
            onClick={() => handleCMSAccess('media')}
          />
          <CMSCard 
            title="Settings" 
            description="Configure website settings" 
            icon={<FiSettings />} 
            onClick={() => handleCMSAccess('settings')}
          />
        </div>
        
        <div className="flex justify-center">
          <a 
            href="/cms" 
            target="_blank"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Open CMS Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
