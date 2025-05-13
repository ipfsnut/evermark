// src/components/layout/LibraryLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '../auth/ConnectButton';
import { 
  BookOpenIcon, 
  BookmarkIcon, 
  PlusCircleIcon, 
  UserIcon, 
  HomeIcon,
  MenuIcon,
  XIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const navigation = [
    { name: 'Browse Catalog', href: '/', icon: HomeIcon },
    { name: 'Create Entry', href: '/create', icon: PlusCircleIcon },
    { name: 'My Collection', href: '/my-evermarks', icon: BookmarkIcon },
    { name: 'Librarian Profile', href: '/profile', icon: UserIcon },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen flex flex-col bg-wood-texture">
      {/* Header - Library Shelf */}
      <header className="bg-wood-dark border-b border-wood-light shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-2 p-2 text-parchment-light"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-brass" />
                <h1 className="ml-2 text-2xl font-serif font-bold text-parchment-light">
                  Evermark
                </h1>
              </Link>
              <div className="hidden md:flex ml-10 items-center space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-wood-light text-parchment'
                        : 'text-parchment-light hover:bg-wood opacity-80'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Connect Button */}
            <div className="flex items-center">
              <div className="ml-4 flex items-center md:ml-6">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div className="fixed inset-0 bg-ink-dark bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        {/* Sidebar Panel */}
        <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-wood-grain shadow-xl">
          <div className="h-full flex flex-col py-6 bg-wood bg-opacity-95">
            <div className="px-4 flex items-center justify-between">
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-brass" />
                <h2 className="ml-2 text-xl font-serif font-bold text-parchment-light">
                  Evermark
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-parchment-light hover:text-parchment"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flex-1 px-4">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-base font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-wood-light text-parchment'
                        : 'text-parchment-light hover:bg-wood opacity-80'
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
      
      {/* Main Content */}
      <div className="py-6 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Library Desk */}
          <div className="bg-parchment-texture rounded-lg shadow-inner p-6 sm:p-8 border border-wood-dark">
            {children}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-wood-dark border-t border-wood-light mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-parchment-light text-sm font-serif">
          © 2025 Evermark Library. All rights reserved.
        </div>
      </footer>
    </div>
  );
};