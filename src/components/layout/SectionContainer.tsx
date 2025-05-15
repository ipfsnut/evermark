// src/components/layout/SectionContainer.tsx
import React from 'react';

interface SectionContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'paper' | 'card' | 'transparent';
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  title,
  className = '',
  variant = 'default',
}) => {
  // Variant-specific styling
  const variantClasses = {
    default: 'bg-parchment-texture dark:bg-ink-light/20 border border-wood-light/30 dark:border-brass/20',
    paper: 'bg-notebook-paper dark:bg-ink-light/30 border border-wood-light dark:border-brass/30',
    card: 'bg-index-card dark:bg-ink-light/40 border border-wood dark:border-brass/40',
    transparent: 'bg-transparent',
  };

  return (
    <div className={`rounded-lg shadow-md overflow-hidden mb-8 ${variantClasses[variant]} ${className}`}>
      {title && (
        <div className="bg-wood-texture px-6 py-4 border-b border-brass/30 relative">
          <div className="absolute inset-0 bg-black bg-opacity-70 dark:bg-opacity-80"></div>
          <h2 className="text-lg font-serif font-semibold text-parchment-light relative z-10">
            {title}
          </h2>
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};