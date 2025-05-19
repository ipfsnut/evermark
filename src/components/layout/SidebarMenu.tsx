import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XIcon, HomeIcon, PlusIcon, BookmarkIcon, UserIcon, Sun, Moon, TrophyIcon, HistoryIcon, DollarSignIcon, LogOutIcon, CopyIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void; 
}

// Define the correct type for the MenuLink props
interface MenuLinkProps {
  icon: React.ReactNode;
  to: string;
  label: string;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onClose, darkMode = false, toggleDarkMode }) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!user?.username) return 'U';
    return user.username
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Shortened wallet address
  const shortenedAddress = user?.walletAddress 
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '';
  
  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      // Could add a toast notification here
    }
  };
  
  // Handle profile click
  const goToProfile = () => {
    navigate('/profile');
    onClose();
  };
  
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
      
      {/* Profile Section - New Addition */}
      {isAuthenticated && user ? (
        <div 
          style={{
            padding: '20px',
            marginTop: '15px',
            marginBottom: '5px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: '1px solid rgba(240, 240, 240, 0.2)',
            paddingBottom: '20px'
          }}
        >
          {/* Profile Picture Circle */}
          <div 
            onClick={goToProfile}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(203, 155, 75, 0.3)', // Brass color to match theme
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#f0f0f0',
              cursor: 'pointer',
              border: '2px solid rgba(203, 155, 75, 0.6)',
              marginBottom: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Placeholder for when we implement actual profile pictures */}
            {getInitials()}
          </div>
          
          {/* Username */}
          <div 
            style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#f0f0f0',
              marginBottom: '4px'
            }}
          >
            {user.username || 'Anonymous User'}
          </div>
          
          {/* Wallet Address */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: 'rgba(240, 240, 240, 0.8)',
              fontFamily: 'monospace'
            }}
          >
            {shortenedAddress}
            <button 
              onClick={copyAddress}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '4px',
                color: '#f0f0f0'
              }}
            >
              <CopyIcon size={14} />
            </button>
          </div>
          
          {/* Profile & Sign Out Buttons */}
          <div 
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '12px',
              width: '100%'
            }}
          >
            <button
              onClick={goToProfile}
              style={{
                flex: '1',
                padding: '6px 12px',
                borderRadius: '4px',
                backgroundColor: 'rgba(203, 155, 75, 0.3)', // Brass color
                color: '#f0f0f0',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              <UserIcon size={14} style={{ marginRight: '4px' }} />
              Profile
            </button>
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              style={{
                flex: '1',
                padding: '6px 12px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#f0f0f0',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              <LogOutIcon size={14} style={{ marginRight: '4px' }} />
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div 
          style={{
            padding: '20px',
            marginTop: '15px', 
            marginBottom: '5px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: '1px solid rgba(240, 240, 240, 0.2)',
            paddingBottom: '20px'
          }}
        >
          <div 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: '#f0f0f0',
              marginBottom: '12px'
            }}
          >
            <UserIcon size={32} />
          </div>
          <div 
            style={{
              fontSize: '16px',
              color: '#f0f0f0',
              marginBottom: '12px'
            }}
          >
            Not signed in
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: 'rgba(203, 155, 75, 0.3)', // Brass color
              color: '#f0f0f0',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Connect Wallet
          </button>
        </div>
      )}
      
      {/* Logo section - moved below profile */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '20px',
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
          marginTop: '4px'
        }}>
          Menu
        </span>
      </div>
      
      <nav style={{ flex: 1 }}>
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
          <MenuLink icon={<TrophyIcon size={18} />} to="/leaderboard" label="Leaderboard" />
          <MenuLink icon={<DollarSignIcon size={18} />} to="/auctions" label="Auctions" />
          <MenuLink icon={<HistoryIcon size={18} />} to="/voting-history" label="Voting History" />
        </ul>
      </nav>
      
      {/* Dark mode toggle - moved to bottom */}
      {toggleDarkMode && (
        <div style={{
          marginTop: 'auto', 
          paddingTop: '20px',
          borderTop: '1px solid rgba(240, 240, 240, 0.2)',
          padding: '20px'
        }}>
          <button
            onClick={toggleDarkMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#f0f0f0',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <>
                <Sun style={{ marginRight: '12px' }} size={18} />
                <span style={{ fontWeight: '500', fontSize: '16px' }}>Light Mode</span>
              </>
            ) : (
              <>
                <Moon style={{ marginRight: '12px' }} size={18} />
                <span style={{ fontWeight: '500', fontSize: '16px' }}>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      )}
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