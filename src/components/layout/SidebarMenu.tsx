import React from 'react';
import { Link } from 'react-router-dom';
import { XIcon, HomeIcon, PlusIcon, BookmarkIcon, UserIcon } from 'lucide-react';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

// Define the correct type for the MenuLink props
interface MenuLinkProps {
  icon: React.ReactNode;
  to: string;
  label: string;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onClose, darkMode = false }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '280px',
      height: '100%',
      backgroundImage: 'url("/textures/wood-grain.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '0',
      boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
      zIndex: 100,
      overflowY: 'auto'
    }}>
      {/* Dark overlay for better text visibility */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.7)', // Slightly darker in dark mode
        zIndex: -1
      }} />
      
      {/* Content container */}
      <div style={{ position: 'relative', padding: '20px' }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#f0f0f0',
            zIndex: 2
          }}
        >
          <XIcon />
        </button>
        
        {/* Logo instead of "Menu" text */}
        <div style={{ 
          marginTop: '40px', 
          textAlign: 'center',
          marginBottom: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img 
            src="/EvermarkLogo.png" 
            alt="Evermark Logo" 
            style={{
              height: '40px',
              maxWidth: '150px',
              width: 'auto',
              marginBottom: '10px'
            }}
          />
          <span style={{
            color: '#f0f0f0',
            fontSize: '16px',
            marginTop: '8px'
          }}>
            Menu
          </span>
        </div>
        
        <nav>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <MenuLink icon={<HomeIcon size={18} />} to="/" label="Home" />
            <MenuLink icon={<PlusIcon size={18} />} to="/create" label="Create" />
            <MenuLink icon={<BookmarkIcon size={18} />} to="/my-evermarks" label="My Evermarks" />
            <MenuLink icon={<UserIcon size={18} />} to="/profile" label="Profile" />
          </ul>
        </nav>
      </div>
    </div>
  );
};

// Helper component for menu links with proper typing
const MenuLink: React.FC<MenuLinkProps> = ({ icon, to, label }) => (
  <li>
    <Link 
      to={to} 
      style={{ 
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        textDecoration: 'none',
        color: '#f0f0f0',
        borderRadius: '6px',
        transition: 'background-color 0.2s',
        fontWeight: '500',
        fontSize: '16px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span style={{ marginRight: '12px' }}>{icon}</span>
      {label}
    </Link>
  </li>
);
