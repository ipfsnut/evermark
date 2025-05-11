import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            © 2025 Evermark. All rights reserved.
          </div>
          
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
};