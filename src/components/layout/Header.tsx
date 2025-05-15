// src/components/layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, Moon, Sun } from 'lucide-react';
import { EvermarkLogo } from '../common/EvermarkLogo';

interface HeaderProps {
  onMenuOpen: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentPath?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuOpen, 
  darkMode, 
  toggleDarkMode,
  currentPath
}) => {
  const getPageTitle = (path: string): string => {
    switch(path) {
      case '/': return 'Library Home';
      case '/create': return 'Add to Collection';
      case '/my-evermarks': return 'My Collection';
      case '/profile': return 'Profile';
      default:
        if (path.startsWith('/evermark/')) return 'Evermark Details';
        return '';
    }
  };

  return (
    <header className="relative bg-wood-texture border-b border-brass/30 shadow-md z-20">
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-70 dark:bg-opacity-80"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={onMenuOpen}
            className="p-1.5 mr-3 rounded-full text-parchment-light hover:bg-black/20 transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center">
            {/* The logo is now properly sized for the header */}
            <EvermarkLogo size="lg" className="mr-2" />
          </div>
          
          {/* Page title indicator */}
          {currentPath && (
            <>
              <div className="hidden sm:block h-6 mx-3 w-px bg-brass/30"></div>
              <h2 className="hidden sm:block text-parchment-light font-serif tracking-wide text-sm">
                {getPageTitle(currentPath)}
              </h2>
            </>
          )}
        </div>
        
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-full text-parchment-light hover:bg-black/20 transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
};