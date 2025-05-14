import React from 'react';
import { Link } from 'react-router-dom';

interface EvermarkLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  customHeight?: number; // Allow custom height override
  withLink?: boolean;
  className?: string;
}

export const EvermarkLogo: React.FC<EvermarkLogoProps> = ({ 
  size = 'md', 
  customHeight,
  withLink = true,
  className = ''
}) => {
  // Map size names to Tailwind classes with smaller values
  const sizeClasses = {
    xs: 'h-4 w-auto', // Extra small - 16px
    sm: 'h-5 w-auto', // Small - 20px
    md: 'h-6 w-auto', // Medium - 24px (reduced from h-8)
    lg: 'h-8 w-auto', // Large - 32px (reduced from h-12)
    xl: 'h-10 w-auto'  // Extra large - 40px (reduced from h-16)
  };

  // Use inline style for custom height if provided
  const style = customHeight ? { height: `${customHeight}px` } : {};

  const logoImg = (
    <img 
      src="/EvermarkLogoSmall.png" 
      alt="Evermark Logo"
      className={`${sizeClasses[size]} ${className}`}
      style={style}
    />
  );

  if (withLink) {
    return (
      <Link to="/" className="inline-block">
        {logoImg}
      </Link>
    );
  }

  return logoImg;
};
