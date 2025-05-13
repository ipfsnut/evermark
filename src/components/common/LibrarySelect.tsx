// src/components/common/LibrarySelect.tsx
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface LibrarySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
}

export const LibrarySelect: React.FC<LibrarySelectProps> = ({
  label,
  error,
  hint,
  options,
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-serif font-medium text-ink-dark mb-1">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full px-4 py-2 bg-parchment-light bg-opacity-80 border ${
            error ? 'border-red-500' : 'border-wood-light'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-brass font-serif shadow-sm appearance-none ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-ink-light">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-serif">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-ink-light font-serif">{hint}</p>
      )}
    </div>
  );
};