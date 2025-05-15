import React, { ElementType, ComponentPropsWithRef } from 'react';
import { Loader2 } from 'lucide-react';

// Define variant and size options
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

// This allows the component to accept any element type's props
type PolymorphicRef<C extends ElementType> = ComponentPropsWithRef<C>['ref'];
type PolymorphicProps<C extends ElementType, Props = {}> = Props & 
  Omit<ComponentPropsWithRef<C>, keyof Props> & {
    as?: C;
    ref?: PolymorphicRef<C>;
  };

// Base props specific to our button component
interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// Create the polymorphic component type
export type StyledButtonProps<C extends ElementType = 'button'> = PolymorphicProps<C, ButtonBaseProps>;

// The default element type is 'button'
export const StyledButton = <C extends ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  ...props
}: StyledButtonProps<C>) => {
  const Component = as || 'button';
  
  // Combine variant and size classes
  const variantClasses = {
    primary: 'bg-warpcast text-white hover:bg-warpcast-dark border-warpcast/30',
    secondary: 'bg-parchment text-ink-dark hover:bg-parchment-dark border-wood-light',
    tertiary: 'bg-transparent text-ink-dark hover:bg-parchment-dark border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-red-400'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-lg'
  };
  
  const baseClasses = `
    inline-flex items-center justify-center
    border font-serif font-medium
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-warpcast/40 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;
  
  return (
    <Component
      className={combinedClasses}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </Component>
  );
};
