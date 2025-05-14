// src/components/layout/LibraryLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '../auth/ConnectButton';
import { 
  BookOpenIcon, 
  BookmarkIcon, 
  PlusIcon, 
  UserIcon, 
  HomeIcon,
  MenuIcon,
  XIcon
} from 'lucide-react';

interface LibraryLayoutProps {
  children: React.ReactNode;
}

export const LibraryLayout: React.FC<LibraryLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const navigation = [
    { name: 'Browse', href: '/', icon: HomeIcon },
    { name: 'Create', href: '/create', icon: PlusIcon },
    { name: 'My Evermarks', href: '/my-evermarks', icon: BookmarkIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen bg-parchment-light">
      {/* Collapsible sidebar for both mobile and desktop */}
      <div className={`fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-ink-dark bg-opacity-75" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-wood-texture shadow-xl">
          <div className="h-full flex flex-col py-6 bg-wood bg-opacity-95">
            {/* Close button and logo */}
            <div className="px-4 flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-brass" />
                <h1 className="ml-2 text-xl font-serif font-bold text-parchment-light">
                  Evermark
                </h1>
              </Link>
              <button
                type="button"
                className="text-parchment-light hover:text-parchment focus:outline-none"
                onClick={() => setSidebarOpen(false)}
              >
                <XIcon className="h-6 w-6" />
                <span className="sr-only">Close sidebar</span>
              </button>
            </div>
            
            {/* Navigation */}
            <div className="mt-6 flex-1 px-4">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-base font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-wood-light text-parchment'
                        : 'text-parchment-light hover:bg-wood hover:text-parchment'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content wrapper - no left padding needed since sidebar is hidden by default */}
      <div className="flex flex-col min-h-screen">
        {/* Header - with menu button visible on all screen sizes */}
        <header className="sticky top-0 z-20 bg-wood-dark border-b border-wood-light shadow-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Menu button - visible on all screen sizes */}
            <div className="flex items-center">
              <button
                type="button"
                className="text-parchment-light hover:text-parchment focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
              </button>
              
              {/* Title next to menu button */}
              <Link to="/" className="ml-3 text-parchment-light hover:text-parchment transition-colors font-serif">
                Evermark Library
              </Link>
            </div>
            
            {/* Connect Button */}
            <ConnectButton />
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-parchment-texture rounded-lg shadow-inner p-6 sm:p-8 border border-wood-light">
              {children}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-wood-dark border-t border-wood-light mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-parchment-light text-sm font-serif">
            © 2025 Evermark Library. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};
