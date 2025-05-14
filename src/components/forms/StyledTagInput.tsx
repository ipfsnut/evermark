import React, { useState } from 'react';
import { AlertCircleIcon, X, TagIcon } from 'lucide-react';

interface StyledTagInputProps {
  id: string;
  label: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  labelClassName?: string;
  containerClassName?: string;
  maxTags?: number;
}

export const StyledTagInput: React.FC<StyledTagInputProps> = ({
  id,
  label,
  tags,
  onAddTag,
  onRemoveTag,
  error,
  hint,
  required,
  labelClassName = '',
  containerClassName = '',
  maxTags = 10
}) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onAddTag(trimmed);
      setInputValue('');
    }
  };
  
  return (
    <div className={`mb-5 ${containerClassName}`}>
      <label 
        htmlFor={id} 
        className={`block font-serif text-ink-dark text-sm mb-2 font-medium ${labelClassName}`}
      >
        {label} {required && <span className="text-warpcast">*</span>}
      </label>
      
      <div className={`
        p-2 bg-parchment-texture border rounded-md min-h-[80px]
        ${error ? 'border-red-500' : 'border-wood-light hover:border-warpcast/50'} 
        focus-within:ring-1 focus-within:ring-warpcast/40 focus-within:border-warpcast
        transition-all duration-200
      `}>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <div 
              key={tag} 
              className="flex items-center bg-warpcast/10 px-2 py-1 rounded text-sm font-serif text-ink-dark border border-warpcast/20"
            >
              <TagIcon className="h-3 w-3 mr-1 text-warpcast-dark/70" />
              <span>{tag}</span>
              <button 
                type="button" 
                onClick={() => onRemoveTag(tag)}
                className="ml-1 text-ink-light hover:text-warpcast-dark focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        
        {tags.length < maxTags && (
          <div className="flex items-center">
            <input
              id={id}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addTag}
              placeholder="Type and press Enter to add a tag..."
              className="w-full bg-transparent border-none shadow-none focus:outline-none focus:ring-0 p-1 font-serif text-ink-dark text-sm"
            />
          </div>
        )}
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