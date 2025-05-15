import React from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, Moon, Sun } from 'lucide-react';
import { EvermarkLogo } from '../common/EvermarkLogo';
import { ConnectButton } from '../auth/ConnectButton';

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
    <header className="relative bg-wood-texture border-b border-brass/30 shadow-md z-20" role="banner">
      {/* Content within the header is already properly organized with z-index */}
      
      <div className="relative z-10 wide-container py-2 flex justify-between items-center">
        {/* Left side with menu and logo */}
        <div className="flex items-center">
          <button 
            onClick={onMenuOpen}
            className="btn-icon text-parchment-light"
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center">
            <EvermarkLogo size="sm" className="mr-2" />
          </div>
          
          {currentPath && (
            <>
              <div className="hidden sm:block h-6 mx-3 w-px bg-brass/30"></div>
              <h2 className="hidden sm:block text-parchment-light font-serif tracking-wide text-sm">
                {getPageTitle(currentPath)}
              </h2>
            </>
          )}
        </div>
        
        {/* Right side with wallet connect and theme toggle */}
        <div className="flex items-center space-x-3">
          {/* Wallet connect button */}
          <ConnectButton />
          
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="btn-icon text-parchment-light"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
