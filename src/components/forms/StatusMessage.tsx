import React from 'react';
import { CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error';
  message: string;
  subMessage?: string;
  className?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ 
  type, 
  message, 
  subMessage,
  className = ''
}) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  
  return (
    <div className={`
      p-4 
      ${isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} 
      border rounded-md animate-text-in shadow-sm
      ${className}
    `}>
      <div className="flex">
        {isSuccess ? (
          <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
        ) : (
          <AlertCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
        )}
        <div className="ml-3">
          <p className={`text-sm font-serif tracking-wide ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
            {message}
          </p>
          {subMessage && (
            <p className={`text-xs font-serif mt-1 tracking-wide ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};