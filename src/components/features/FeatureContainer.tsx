// src/components/features/FeatureContainer.tsx
import React from 'react';
import { StatusMessage } from '../forms/StatusMessage';

interface FeatureContainerProps {
  title?: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

export const FeatureContainer: React.FC<FeatureContainerProps> = ({ 
  title,
  loading = false, 
  error = null, 
  children,
  className = ''
}) => {
  if (loading) {
    return (
      <div className="animate-pulse p-6 bg-parchment-texture rounded-lg">
        {title && <div className="h-6 bg-wood-light/20 rounded w-1/3 mb-4"></div>}
        <div className="h-4 bg-wood-light/20 rounded w-full mb-2"></div>
        <div className="h-4 bg-wood-light/20 rounded w-5/6"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <StatusMessage
        type="error"
        message="Failed to load data"
        subMessage={error}
      />
    );
  }
  
  return (
    <div className={`bg-parchment-texture p-6 rounded-lg shadow-md animate-text-in ${className}`}>
      {title && <h2 className="text-responsive-subtitle text-ink-dark font-serif mb-4">{title}</h2>}
      {children}
    </div>
  );
};