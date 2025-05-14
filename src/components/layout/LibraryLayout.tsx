import React, { useState, useEffect } from 'react';
import { MenuIcon, Moon, Sun } from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';

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
    <div style={{
      backgroundColor: darkMode ? '#222' : '#f5f5f0',
      color: darkMode ? '#f0f0f0' : '#333',
      minHeight: '100vh',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      {/* Header with dark mode toggle */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`,
        backgroundColor: darkMode ? '#333' : 'white',
      }}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: darkMode ? '#f0f0f0' : '#333',
          }}
        >
          <MenuIcon />
          <span style={{ marginLeft: '8px' }}>Menu</span>
        </button>
        
        <button
          onClick={toggleDarkMode}
          style={{ 
            padding: '8px',
            border: 'none',
            borderRadius: '50%',
            backgroundColor: darkMode ? '#555' : '#eee',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: darkMode ? '#f0f0f0' : '#333',
          }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          {/* Children content */}
          {children}
        </div>
      </div>
      
      {/* Use the SidebarMenu component with dark mode prop */}
      <SidebarMenu 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
};
