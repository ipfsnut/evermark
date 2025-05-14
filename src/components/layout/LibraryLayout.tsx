import React, { useState, useEffect } from 'react';
import { MenuIcon, Moon, Sun } from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { EvermarkLogo } from '../common/EvermarkLogo';

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
  
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          
          <EvermarkLogo size="xs" />
        </div>
        
        <button
          onClick={toggleDarkMode}
          className="dark-toggle"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="content-container content-centered">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className={`py-4 text-center ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        <div className="content-container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
<img 
  src="/EvermarkLogo.png" 
  alt="Evermark Logo"
  style={{ height: '16px', maxWidth: '60px', width: 'auto' }}
/>            <span className="ml-2">© 2025 Evermark. All rights reserved.</span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Help</a>
          </div>
        </div>
      </footer>
      
      {/* Sidebar */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
};
