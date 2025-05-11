import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '../auth/ConnectButton';

const navigation = [
  { name: 'Browse', href: '/' },
  { name: 'Create', href: '/create' },
  { name: 'My Evermarks', href: '/my-evermarks' },
  { name: 'Profile', href: '/profile' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Evermark
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
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
      <nav className="md:hidden border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};