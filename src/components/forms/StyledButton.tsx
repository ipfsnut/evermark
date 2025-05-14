import React from 'react';

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  // Define variant classes
  const variantStyles = {
    primary: 'bg-warpcast text-white hover:bg-warpcast-dark border border-warpcast',
    secondary: 'bg-wood-light text-parchment-light hover:bg-wood border border-wood',
    outline: 'bg-transparent text-warpcast hover:bg-warpcast/5 border border-warpcast',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600'
  };
  
  // Define size classes
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Combine all classes
  const buttonClasses = `
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    rounded-md font-serif font-medium
    transition-all duration-200
    shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 
    ${variant === 'primary' ? 'focus:ring-warpcast/50' : ''}
    ${variant === 'secondary' ? 'focus:ring-wood-light/50' : ''}
    ${variant === 'outline' ? 'focus:ring-warpcast/30' : ''}
    ${variant === 'danger' ? 'focus:ring-red-500/50' : ''}
    ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}
    flex items-center justify-center
    ${className}
  `;
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </button>
  );
};