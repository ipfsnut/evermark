// src/components/common/LibraryButton.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface LibraryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'stamp';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const LibraryButton: React.FC<LibraryButtonProps> = ({
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  children,
  className,
  ...props
}) => {
  const baseClasses = "relative font-serif rounded-md px-4 py-2 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-wood text-parchment-light hover:bg-wood-dark shadow-md hover:-translate-y-0.5 focus:ring-wood border border-brass",
    secondary: "bg-parchment border border-wood hover:bg-parchment-dark text-ink shadow-sm hover:-translate-y-0.5 focus:ring-parchment-dark",
    stamp: "bg-red-600 hover:bg-red-700 text-white shadow-md hover:-translate-y-0.5 focus:ring-red-500 overflow-hidden",
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {variant === 'stamp' && (
        <div className="absolute inset-0 opacity-20 bg-[url('/textures/parchment.jpg')] bg-center bg-cover blend-overlay"></div>
      )}
      <div className="flex items-center justify-center space-x-2">
        {Icon && iconPosition === 'left' && <Icon className="h-5 w-5" />}
        <span>{children}</span>
        {Icon && iconPosition === 'right' && <Icon className="h-5 w-5" />}
      </div>
    </button>
  );
};