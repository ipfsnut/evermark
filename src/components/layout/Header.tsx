// src/components/layout/Header.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '../auth/ConnectButton';
import { BookOpenIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Browse', href: '/' },
    { name: 'Create', href: '/create' },
    { name: 'My Evermarks', href: '/my-evermarks' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <header style={{ backgroundColor: '#5a4331' }} className="shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <BookOpenIcon style={{ color: '#c4a55f' }} className="h-8 w-8" />
            <h1 style={{ color: '#f5f1e4', fontFamily: 'Georgia, serif' }} className="text-2xl font-bold ml-2">
              Evermark
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                style={{ 
                  color: isActive(item.href) ? '#c4a55f' : '#f5f1e4',
                  fontFamily: 'Georgia, serif'
                }}
                className="text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Connect Button */}
          <ConnectButton />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t" style={{ backgroundColor: '#7d5f45' }}>
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                style={{ 
                  color: isActive(item.href) ? '#c4a55f' : '#f5f1e4',
                  fontFamily: 'Georgia, serif'
                }}
                className="text-xs font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};