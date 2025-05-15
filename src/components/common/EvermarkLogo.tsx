// src/components/common/EvermarkLogo.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface EvermarkLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withLink?: boolean;
  className?: string;
}

export const EvermarkLogo: React.FC<EvermarkLogoProps> = ({ 
  size = 'md', 
  withLink = true,
  className = ''
}) => {
  // Use explicit pixel dimensions to force the correct size
  const sizeMap = {
    xs: { height: 24, width: 24 },  // Extra small - for header/footer
    sm: { height: 32, width: 32 },  // Small
    md: { height: 40, width: 40 },  // Medium
    lg: { height: 64, width: 64 },  // Large
    xl: { height: 96, width: 96 }   // Extra large
  };

  // Use inline styles with specific dimensions
  const logoStyle = {
    height: `${sizeMap[size].height}px`,
    width: `${sizeMap[size].width}px`,
    maxHeight: `${sizeMap[size].height}px`, // Add max constraints
    maxWidth: `${sizeMap[size].width}px`,
    objectFit: 'contain' as const
  };

  const logoImg = (
    <img 
      src="/apple-touch-icon.png" // Use apple-touch-icon as the source
      alt="Evermark Library"
      className={`${className}`}
      style={logoStyle}
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