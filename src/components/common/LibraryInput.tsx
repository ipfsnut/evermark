// src/components/common/LibraryInput.tsx
import React from 'react';

interface LibraryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const LibraryInput: React.FC<LibraryInputProps> = ({
  label,
  error,
  hint,
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
      <input
        className={`w-full px-4 py-2 bg-parchment-light bg-opacity-80 border ${
          error ? 'border-red-500' : 'border-wood-light'
        } rounded-md focus:outline-none focus:ring-2 focus:ring-brass font-serif shadow-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 font-serif">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-ink-light font-serif">{hint}</p>
      )}
    </div>
  );
};
