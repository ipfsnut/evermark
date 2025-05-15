// src/components/forms/FormContainer.tsx
import React from 'react';

interface FormContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  width?: 'full' | 'narrow' | 'medium';
  accentColor?: 'purple' | 'brass' | 'none';
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  title,
  description,
  className = '',
  width = 'narrow',
  accentColor = 'purple',
}) => {
  // Width classes
  const widthClasses = {
    full: 'w-full',
    narrow: 'max-w-xl mx-auto',
    medium: 'max-w-2xl mx-auto',
  };
  
  // Accent color classes
  const accentClasses = {
    purple: 'border-l-4 border-l-warpcast',
    brass: 'border-l-4 border-l-brass',
    none: '',
  };

  return (
    <div className={`bg-notebook-paper dark:bg-ink-light/20 rounded-lg shadow-lg overflow-hidden border border-wood-light/50 dark:border-brass/20 ${widthClasses[width]} ${accentClasses[accentColor]} ${className}`}>
      {(title || description) && (
        <div className="p-6 border-b border-wood-light/30 dark:border-brass/20">
          {title && (
            <h2 className="text-xl font-serif font-semibold text-ink-dark dark:text-parchment-light text-center mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-ink-light dark:text-parchment-light/70 font-serif text-center text-sm">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};