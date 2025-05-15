// src/components/layout/LibraryLayout.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarMenu } from './SidebarMenu';
import { Header } from './Header';
import { Footer } from './Footer';

interface LibraryLayoutProps {
  children: React.ReactNode;
}

export const LibraryLayout: React.FC<LibraryLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or default to system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const location = useLocation();
  
  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Save preference
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);
  
  // Effect for page transitions
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  return (
    <div className="min-h-screen flex flex-col bg-parchment-light dark:bg-ink-dark transition-colors duration-300">
      {/* Use the Header component */}
      <Header 
        onMenuOpen={() => setSidebarOpen(true)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        currentPath={location.pathname}
      />
      
      {/* Main content - enhanced with subtle background texture */}
      <main className="flex-1 relative bg-parchment-light dark:bg-ink-dark transition-colors duration-300">
  {/* Subtle parchment background texture */}
  <div className="absolute inset-0 bg-parchment-texture opacity-30 dark:opacity-5 pointer-events-none"></div>
  
  {/* Content container with page-turn animation */}
  <div 
    key={location.pathname}
    className="relative z-10 content-container py-6 sm:py-8 animate-page-in"
  >
    {children}
  </div>
</main>
      
      {/* Use the Footer component */}
      <Footer />
      
      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </div>
  );
};