'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import BiCard from '@/components/dashboard/BiCard';
import ChartCard from '@/components/dashboard/ChartCard';
import CMSIntegration from '@/components/dashboard/CMSIntegration';
import ClearTokensButton from '@/components/dashboard/ClearTokensButton';
import {
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiCheckSquare,
  FiBook,
  FiEdit3,
  FiSend,
  FiCreditCard,
  FiMessageCircle,
  FiCheckCircle,
  FiCalendar,
  FiBookOpen
} from 'react-icons/fi';

// Error boundary component
class DashboardErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Dashboard error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="mb-4">There was an error loading this dashboard component.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {this.state.error && this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

function ProviderDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/courses/status');
        if (res.ok) {
          const data = await res.json();
          setCounts(data.counts || {});
        }
      } catch (err) {
        console.error('Error loading status counts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const statusCards = [
    { key: 'draft', label: 'Draft', icon: <FiEdit3 className="w-6 h-6" />, color: 'yellow' },
    { key: 'submitted', label: 'Submitted', icon: <FiSend className="w-6 h-6" />, color: 'blue' },
    { key: 'awaiting_payment', label: 'Awaiting Payment', icon: <FiCreditCard className="w-6 h-6" />, color: 'purple' },
    { key: 'in_peer_review', label: 'In Peer Review', icon: <FiUsers className="w-6 h-6" />, color: 'green' },
    { key: 'awaiting_feedback', label: 'Awaiting Feedback', icon: <FiMessageCircle className="w-6 h-6" />, color: 'yellow' },
    { key: 'approved', label: 'Approved', icon: <FiCheckCircle className="w-6 h-6" />, color: 'green' },
    { key: 'scheduling', label: 'Scheduling', icon: <FiCalendar className="w-6 h-6" />, color: 'blue' },
    { key: 'delivered', label: 'Delivered', icon: <FiBookOpen className="w-6 h-6" />, color: 'purple' },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Application Status</h2>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map(card => (
            <BiCard
              key={card.key}
              title={card.label}
              value={counts[card.key] || 0}
              icon={card.icon}
              color={card.color as any}
              isClickable={false}
            />
          ))}
        </div>
      )}

      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Reusable Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Quality Assurance','E-Learning','Distance Learning','Directed Learning','Assessment','Ethics'].map(name => (
            <div key={name} className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium">{name}</h3>
              <p className="text-sm text-gray-500">Manage {name} frameworks</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Speakers</h3>
          <p className="text-sm text-gray-600">Define commonly used speakers for quick selection when creating applications.</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-6">You need to be logged in to access the dashboard.</p>
          <a 
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  
  // Get user roles
  const userRoles = session?.user?.roles || [];
  const isAdmin = userRoles.includes('AdminFull') || userRoles.includes('AdminReadOnly');
  const isFullAdmin = userRoles.includes('AdminFull');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome, {session?.user?.name || session?.user?.email}
        </div>
      </div>
      
      {/* Admin Dashboard */}
      {isAdmin && (
        <DashboardErrorBoundary>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <BiCard
                title="Users"
                value="156"
                icon={<FiUsers className="w-6 h-6" />}
              />
              <BiCard
                title="Applications"
                value="28"
                icon={<FiFileText className="w-6 h-6" />}
              />
              <BiCard
                title="Invoices"
                value="€12,450"
                icon={<FiDollarSign className="w-6 h-6" />}
              />
              <BiCard
                title="Reviews"
                value="42"
                icon={<FiCheckSquare className="w-6 h-6" />}
              />
              <BiCard
                title="Courses"
                value="75"
                icon={<FiBook className="w-6 h-6" />}
              />
            </div>
          </div>
        </DashboardErrorBoundary>
      )}
      
      {/* Charts Section */}
      {isAdmin && (
        <DashboardErrorBoundary>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Applications by Month"
                chartType="bar"
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [
                    {
                      label: 'Applications',
                      data: [12, 19, 15, 8, 22, 14],
                      backgroundColor: '#3B82F6'
                    }
                  ]
                }}
              />
              <ChartCard
                title="Course Categories"
                chartType="pie"
                data={{
                  labels: ['Small Animal', 'Large Animal', 'Exotic', 'General Practice', 'Specialty'],
                  datasets: [
                    {
                      data: [35, 25, 10, 20, 10],
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                    }
                  ]
                }}
              />
            </div>
          </div>
        </DashboardErrorBoundary>
      )}
      
      {/* CMS Integration */}
      {isFullAdmin && (
        <DashboardErrorBoundary>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Content Management</h2>
            <CMSIntegration />
          </div>
        </DashboardErrorBoundary>
      )}
      
      {/* Provider Dashboard */}
      {!isAdmin && (
        <DashboardErrorBoundary>
          <ProviderDashboard />
        </DashboardErrorBoundary>
      )}
      
      {/* Admin Tools */}
      {isFullAdmin && (
        <DashboardErrorBoundary>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Authentication Management</h3>
              <ClearTokensButton className="mb-4" />
              <p className="text-sm text-gray-500">
                This will clear all authentication tokens and force all users to log in again.
                You will also be logged out and need to authenticate again.
              </p>
            </div>
          </div>
        </DashboardErrorBoundary>
      )}
    </div>
  );
}
