// src/components/layout/LibraryLayout.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '../auth/ConnectButton';
import { 
  BookOpenIcon, 
  BookmarkIcon, 
  PlusIcon, 
  UserIcon, 
  HomeIcon,
  MenuIcon,
  XIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';

interface LibraryLayoutProps {
  children: React.ReactNode;
}

export const LibraryLayout: React.FC<LibraryLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const location = useLocation();
  
  // Set sidebar open on large screens by default
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // Check on initial load
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const navigation = [
    { name: 'Browse', href: '/', icon: HomeIcon },
    { name: 'Create', href: '/create', icon: PlusIcon },
    { name: 'My Evermarks', href: '/my-evermarks', icon: BookmarkIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  const togglePin = () => {
    setSidebarPinned(!sidebarPinned);
    if (!sidebarOpen) setSidebarOpen(true);
  };
  
  return (
    <div className="h-screen flex overflow-hidden bg-parchment-light">
      {/* Left sidebar - slides in and out with transition */}
      {/* When pinned on large screens, it becomes part of the main layout */}
      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 transition-all duration-300 
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:w-0'}
          ${sidebarPinned ? 'lg:translate-x-0 lg:w-64 lg:shadow-xl' : 'lg:-translate-x-full lg:w-0'}
        `}
      >
        {/* Sidebar backdrop - only visible on mobile when not pinned */}
        {sidebarOpen && !sidebarPinned && (
          <div 
            className="fixed inset-0 bg-ink-dark bg-opacity-75 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}
        
        {/* Sidebar content */}
        <div className="flex flex-col h-full w-64 shadow-lg z-50">
          {/* Sidebar with glass-like effect and wood grain texture */}
          <div className="flex-1 flex flex-col min-h-0 bg-wood-texture relative">
            {/* Overlay */}
            <div className="absolute inset-0 bg-ink-dark bg-opacity-40 backdrop-blur-sm"></div>
            
            {/* Pin/unpin button - visible on large screens */}
            <button
              className="absolute top-3 -right-3 h-6 w-6 rounded-full bg-warpcast flex items-center justify-center shadow-lg transform translate-x-full hidden lg:flex z-10"
              onClick={togglePin}
            >
              {sidebarPinned ? (
                <ChevronLeftIcon className="h-4 w-4 text-white" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-white" />
              )}
            </button>
            
            {/* Content */}
            <div className="relative z-10 pt-5 pb-4 flex-1 overflow-y-auto">
              {/* Header with logo */}
              <div className="flex items-center justify-between px-4 mb-6">
                <Link to="/" className="flex items-center">
                  <BookOpenIcon className="h-8 w-8 text-warpcast" />
                  <h1 className="ml-2 text-xl font-serif font-bold text-parchment-light">
                    Evermark
                  </h1>
                </Link>
                
                {/* Close button - only visible on mobile */}
                <button
                  className="lg:hidden text-parchment-light hover:text-parchment focus:outline-none"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Navigation links */}
              <nav className="px-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-warpcast/20 text-parchment border-l-2 border-warpcast'
                        : 'text-parchment-light/80 hover:bg-warpcast/10 hover:text-parchment hover:border-l-2 hover:border-warpcast/50'
                    }`}
                    onClick={() => !sidebarPinned && setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-warpcast-light' : 'text-parchment-light/60 group-hover:text-warpcast-light/80'}`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - adjust width based on sidebar state */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarPinned ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {/* Top navigation */}
        <header className="w-full flex shadow-md bg-ink-dark border-b border-warpcast/20">
          <div className="flex-1 flex items-center justify-between p-4">
            <div className="flex items-center">
              {/* Sidebar toggle button */}
              <button
                className="text-parchment-light p-2 rounded-full hover:bg-warpcast/20 transition-colors duration-200"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              
              {/* Site title - only visible when sidebar is hidden or on mobile */}
              <Link to="/" className="ml-3 text-parchment-light font-serif tracking-wide">
                Evermark Library
              </Link>

              {/* Search bar - simplified for now */}
              <div className="hidden sm:flex items-center ml-6 relative">
                <div className="relative group">
                  <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-light group-hover:text-warpcast transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 w-56 rounded-full bg-ink-light/20 border border-transparent focus:border-warpcast/50 focus:outline-none focus:ring-1 focus:ring-warpcast transition-all placeholder-ink-light/60 text-parchment-light"
                  />
                </div>
              </div>
            </div>
            
            {/* Connect Button */}
            <ConnectButton />
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className={`max-w-7xl mx-auto transition-all duration-300`}>
            <div className="bg-parchment-texture rounded-lg shadow-xl p-6 border border-wood-light relative overflow-hidden min-h-[calc(100vh-12rem)]">
              {/* Subtle texture overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-warpcast/5 to-ink-dark/10 pointer-events-none" />
              
              {/* Accent corner with warpcast gradient */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-warpcast-light/20 to-transparent pointer-events-none" />
              
              {/* Actual content */}
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-ink-dark border-t border-warpcast/20 text-center py-4">
          <div className="max-w-7xl mx-auto px-4 text-parchment-light/70 text-sm font-serif">
            © 2025 Evermark Library. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};