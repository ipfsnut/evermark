import React from 'react';
import { AlertCircleIcon, ChevronDownIcon } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface StyledSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  label: string;
  options: Option[];
  error?: string;
  hint?: string;
  labelClassName?: string;
  containerClassName?: string;
  icon?: React.ReactNode; // Add the icon prop
}

export const StyledSelect: React.FC<StyledSelectProps> = ({
  id,
  label,
  options,
  error,
  hint,
  required,
  className = '',
  labelClassName = '',
  containerClassName = '',
  icon, // Add icon to the destructured props
  ...props
}) => {
  return (
    <div className={`mb-5 ${containerClassName}`}>
      <label 
        htmlFor={id} 
        className={`block font-serif text-ink-dark text-sm mb-2 font-medium ${labelClassName}`}
      >
        {/* Display the icon if provided */}
        {icon && <span className="mr-2 inline-flex items-center">{icon}</span>}
        {label} {required && <span className="text-warpcast">*</span>}
      </label>
      
      <div className="relative">
        <select
          id={id}
          className={`
            appearance-none w-full px-4 py-3 pr-10 rounded-md 
            bg-parchment-texture border
            ${error ? 'border-red-500' : 'border-wood-light hover:border-warpcast/50'} 
            focus:outline-none focus:ring-1 
            ${error ? 'focus:ring-red-500' : 'focus:ring-warpcast/40 focus:border-warpcast'} 
            transition-all duration-200 
            font-serif text-ink-dark
            shadow-inner
            ${className}
          `}
          required={required}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-light">
          <ChevronDownIcon className="h-5 w-5" />
        </div>
      </div>
      
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
