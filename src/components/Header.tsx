'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import LoginModal from './LoginModal';

interface NavLinkProps {
  href: string;
  label: string;
  active?: boolean;
  requiredRoles?: string[];
  requireAuth?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ 
  href, 
  label, 
  active = false, 
  requiredRoles = [],
  requireAuth = true
}) => {
  const { data: session, status } = useSession();
  const userRoles = session?.user?.roles || [];
  
  // Check if user is authenticated when required
  if (requireAuth && status !== 'authenticated') return null;
  
  // Check if user has required role
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => userRoles.includes(role));
  
  if (!hasRequiredRole) return null;
  
  return (
    <Link 
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        active 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  );
};

interface HeaderProps {
  currentPath: string;
}

const Header: React.FC<HeaderProps> = ({ currentPath }) => {
  const { data: session, status } = useSession();
  const adminRoles = ['AdminFull', 'AdminReadOnly'];
  const fullAdminRoles = ['AdminFull'];
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  
  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsLoginModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };
  
  const handleEmailSent = () => {
    console.log('Email sent successfully');
  };
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">VetCEE Portal</Link>
          <nav className="flex space-x-4">
            {/* Public links (no authentication required) */}
            <NavLink 
              href="/" 
              label="Home" 
              active={currentPath === '/'} 
              requireAuth={false}
            />
            
            {/* Links that require authentication */}
            <NavLink 
              href="/dashboard" 
              label="Dashboard" 
              active={currentPath === '/dashboard'} 
              requireAuth={true}
            />
            <NavLink 
              href="/users" 
              label="Users" 
              active={currentPath === '/users'} 
              requiredRoles={adminRoles}
              requireAuth={true}
            />
            <NavLink 
              href="/courses" 
              label="Courses" 
              active={currentPath === '/courses'} 
              requiredRoles={adminRoles}
              requireAuth={true}
            />
            <NavLink 
              href="/reviews" 
              label="Reviews" 
              active={currentPath === '/reviews'} 
              requiredRoles={adminRoles}
              requireAuth={true}
            />
            <NavLink 
              href="/invoices" 
              label="Invoices" 
              active={currentPath === '/invoices'} 
              requiredRoles={adminRoles}
              requireAuth={true}
            />
            <NavLink
              href="/cms"
              label="CMS"
              active={currentPath === '/cms'}
              requiredRoles={adminRoles}
              requireAuth={true}
            />
            <NavLink 
              href="/profile" 
              label="Profile" 
              active={currentPath === '/profile'} 
              requireAuth={true}
            />
            
            {/* Authentication buttons */}
            {status === 'authenticated' ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={handleLoginClick}
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-900 hover:bg-blue-50"
              >
                Login / Register
              </button>
            )}
          </nav>
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseModal} 
        onEmailSent={handleEmailSent} 
      />
    </header>
  );
};

export default Header;
