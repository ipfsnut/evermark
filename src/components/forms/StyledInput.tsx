import React from 'react';
import { AlertCircleIcon } from 'lucide-react';

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  labelClassName?: string;
  containerClassName?: string;
}

export const StyledInput: React.FC<StyledInputProps> = ({
  id,
  label,
  error,
  hint,
  required,
  className = '',
  labelClassName = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={`mb-5 ${containerClassName}`}>
      <label 
        htmlFor={id} 
        className={`block font-serif text-ink-dark text-sm mb-2 font-medium ${labelClassName}`}
      >
        {label} {required && <span className="text-warpcast">*</span>}
      </label>
      
      <input
        id={id}
        className={`
          w-full px-4 py-3 rounded-md 
          bg-parchment-texture border
          ${error ? 'border-red-500' : 'border-wood-light hover:border-warpcast/50'} 
          focus:outline-none focus:ring-1 
          ${error ? 'focus:ring-red-500' : 'focus:ring-warpcast/40 focus:border-warpcast'} 
          transition-all duration-200 
          font-serif text-ink-dark
          shadow-inner placeholder-ink-light/60
          ${className}
        `}
        required={required}
        {...props}
      />
      
      {hint && !error && (
        <p className="mt-1 text-xs font-serif text-ink-light italic">{hint}</p>
      )}
      
      {error && (
        <div className="mt-1 flex items-center text-red-600">
          <AlertCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-xs font-serif">{error}</span>
        </div>
      )}
    </div>
  );
};