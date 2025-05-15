// src/components/layout/Footer.tsx
import React from 'react';
import { EvermarkLogo } from '../common/EvermarkLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-wood-texture border-t border-brass/30 mt-auto">
      <div className="absolute inset-0 bg-black bg-opacity-80 dark:bg-opacity-90"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-3 md:mb-0 gap-2">
            {/* The logo is properly sized for the footer */}
            <EvermarkLogo size="xs" />
            <span className="text-parchment-light text-sm font-serif">© 2025 Evermark Library</span>
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-parchment-light hover:text-brass transition-colors font-serif">Terms</a>
            <a href="#" className="text-parchment-light hover:text-brass transition-colors font-serif">Privacy</a>
            <a href="#" className="text-parchment-light hover:text-brass transition-colors font-serif">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
};