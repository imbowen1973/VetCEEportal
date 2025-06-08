'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface ClearTokensButtonProps {
  className?: string;
}

const ClearTokensButton: React.FC<ClearTokensButtonProps> = ({ className = '' }) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Check if user has admin role
  const userRoles = session?.user?.roles || [];
  const isAdmin = userRoles.includes('AdminFull');

  if (!isAdmin) return null;

  const handleClearTokens = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/auth/clear-tokens');
      setResult({
        success: true,
        message: response.data.message || 'All tokens cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing tokens:', error);
      setResult({
        success: false,
        error: error.response?.data?.error || 'Failed to clear tokens'
      });
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {!showConfirm ? (
        <button
          onClick={handleClearTokens}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Clear All Authentication Tokens'}
        </button>
      ) : (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-700 font-medium mb-3">
            Warning: This will log out all users, including yourself. You will need to log in again.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleClearTokens}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Confirm Clear All Tokens'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className={`p-3 rounded-md ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.success ? result.message : result.error}
        </div>
      )}
    </div>
  );
};

export default ClearTokensButton;
