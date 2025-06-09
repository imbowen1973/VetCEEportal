'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string | null;
  status: string;
  roles?: string[];
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function AdminUsers({ users: initialUsers, isAdminFull }: { users: User[]; isAdminFull: boolean }) {
  const router = useRouter();
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<Notification | null>(null);
  
  
  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve user');
      }
      
      // Update user in the list
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'approved' } : user
      ));
      
      setNotification({
        type: 'success',
        message: 'User approved successfully'
      });
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred'
      });
    }
  };
  
  const handleRoleChange = async (userId: string, role: string, action: 'add' | 'remove') => {
    try {
      const response = await fetch('/api/admin/users/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role, action }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      // Update user in the list
      setUsers(users.map(user => {
        if (user.id === userId) {
          const roles = [...(user.roles || [])];
          if (action === 'add' && !roles.includes(role)) {
            roles.push(role);
          } else if (action === 'remove') {
            const index = roles.indexOf(role);
            if (index !== -1) {
              roles.splice(index, 1);
            }
          }
          return { ...user, roles };
        }
        return user;
      }));
      
      setNotification({
        type: 'success',
        message: `Role ${action === 'add' ? 'added' : 'removed'} successfully`
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
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-2 text-gray-600">Manage users and their roles</p>
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
          <p>Loading users...</p>
        </div>
      ) : users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.map((role) => (
                        <span key={role} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {role}
                        </span>
                      ))}
                      {(!user.roles || user.roles.length === 0) && (
                        <span className="text-gray-500 text-sm">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {user.status === 'pending' && (
                        <button 
                          className="text-sm text-green-600 hover:text-green-800"
                          onClick={() => handleApprove(user.id)}
                        >
                          Approve
                        </button>
                      )}
                      
                      {isAdminFull && (
                      <div className="relative group">
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Manage Roles
                        </button>
                        <div className="absolute z-10 hidden group-hover:block mt-1 w-48 bg-white rounded-md shadow-lg p-2 border">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Provider</span>
                              {user.roles?.includes('Provider') ? (
                                <button 
                                  className="text-xs text-red-600 hover:text-red-800"
                                  onClick={() => handleRoleChange(user.id, 'Provider', 'remove')}
                                >
                                  Remove
                                </button>
                              ) : (
                                <button 
                                  className="text-xs text-green-600 hover:text-green-800"
                                  onClick={() => handleRoleChange(user.id, 'Provider', 'add')}
                                >
                                  Add
                                </button>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Reviewer</span>
                              {user.roles?.includes('Reviewer') ? (
                                <button 
                                  className="text-xs text-red-600 hover:text-red-800"
                                  onClick={() => handleRoleChange(user.id, 'Reviewer', 'remove')}
                                >
                                  Remove
                                </button>
                              ) : (
                                <button 
                                  className="text-xs text-green-600 hover:text-green-800"
                                  onClick={() => handleRoleChange(user.id, 'Reviewer', 'add')}
                                >
                                  Add
                                </button>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">AdminReadOnly</span>
                              {user.roles?.includes('AdminReadOnly') ? (
                                <button 
                                  className="text-xs text-red-600 hover:text-red-800"
                                  onClick={() => handleRoleChange(user.id, 'AdminReadOnly', 'remove')}
                                >
                                  Remove
                                </button>
                              ) : (
                                <button 
                                  className="text-xs text-green-600 hover:text-green-800"
                                  onClick={() => handleRoleChange(user.id, 'AdminReadOnly', 'add')}
                                >
                                  Add
                                </button>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">AdminFull</span>
                              {user.roles?.includes('AdminFull') ? (
                                <button 
                                  className="text-xs text-red-600 hover:text-red-800"
                                  onClick={() => handleRoleChange(user.id, 'AdminFull', 'remove')}
                                >
                                  Remove
                                </button>
                              ) : (
                                <button 
                                  className="text-xs text-green-600 hover:text-green-800"
                                  onClick={() => handleRoleChange(user.id, 'AdminFull', 'add')}
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p>No users found.</p>
        </div>
      )}
    </div>
  );
}
