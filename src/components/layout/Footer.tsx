// src/components/layout/Footer.tsx
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer 
      style={{ backgroundColor: '#5a4331', color: '#f5f1e4', borderColor: '#9e7e5c' }}
      className="border-t mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div 
            className="text-sm"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            © 2025 Evermark. All rights reserved.
          </div>
          
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
};