// src/components/layout/PageContainer.tsx
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  width?: 'narrow' | 'medium' | 'wide';
  icon?: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  description,
  width = 'medium',
  icon,
  className = '',
}) => {
  // Map width prop to Tailwind classes
  const widthClasses = {
    narrow: 'max-w-2xl',
    medium: 'max-w-4xl',
    wide: 'max-w-6xl',
  };

  return (
    <div className={`mx-auto px-4 animate-page-in ${widthClasses[width]} ${className}`}>
      {/* Page Header - centered with icon support */}
      {(title || description) && (
        <div className="text-center mb-8">
          {title && (
            <h1 className="text-responsive-title text-ink-dark dark:text-parchment-light font-serif tracking-tight mb-3 flex items-center justify-center">
              {icon && <span className="mr-3">{icon}</span>}
              {title}
            </h1>
          )}
          {description && (
            <p className="text-ink-light dark:text-parchment-light/70 font-serif tracking-wide leading-relaxed max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
};