'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Token {
  id: string;
  email: string;
  token: string;
  expires: string;
  status: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function AdminTokens() {
  const router = useRouter();
  const [tokens, setTokens] = React.useState<Token[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [notification, setNotification] = React.useState<Notification | null>(null);
  
  React.useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch('/api/admin/tokens');
        if (response.ok) {
          const data = await response.json();
          setTokens(data.tokens || []);
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load tokens. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTokens();
  }, []);
  
  const handleDelete = async (tokenId: string) => {
    if (!confirm('Are you sure you want to delete this token?')) return;
    
    try {
      const response = await fetch(`/api/admin/tokens/${tokenId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete token');
      }
      
      setTokens(tokens.filter(token => token.id !== tokenId));
      setNotification({
        type: 'success',
        message: 'Token deleted successfully'
      });
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred'
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expired Tokens</h1>
        <p className="mt-2 text-gray-600">Track and manage expired verification tokens</p>
      </div>
      
      {notification && (
        <div className={`p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading tokens...</p>
        </div>
      ) : tokens.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expired At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokens.map((token) => (
                <tr key={token.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{token.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{token.token.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(token.expires).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      token.status === 'used' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className="text-sm text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(token.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p>No expired tokens found.</p>
        </div>
      )}
    </div>
  );
}
