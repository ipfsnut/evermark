// src/pages/CreateEvermarkPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CreateEvermark } from '../components/CreateEvermark';
import { CheckCircleIcon, AlertCircleIcon, BookmarkIcon } from 'lucide-react';

const CreateEvermarkPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSuccess = (evermark: any) => {
    setSuccessMessage(`Evermark "${evermark.title}" created successfully!`);
    setErrorMessage('');
    
    // Navigate to the new evermark after 2 seconds
    setTimeout(() => {
      navigate(`/evermark/${evermark.id}`);
    }, 2000);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage('');
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 bg-parchment-texture rounded-lg border border-wood-light shadow-md">
        <AlertCircleIcon className="mx-auto h-12 w-12 text-wood" />
        <h3 className="mt-2 text-responsive-card-title text-ink-dark font-serif">Not Authenticated</h3>
        <p className="mt-1 text-sm text-ink-light font-serif leading-relaxed tracking-wide">
          Please connect your wallet to create an evermark.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 animate-text-in">
        <div className="flex items-center mb-3">
          <BookmarkIcon className="h-7 w-7 text-warpcast mr-2" />
          <h1 className="text-responsive-title text-ink-dark font-serif">Create New Evermark</h1>
        </div>
        <p className="text-sm text-ink-light font-serif leading-relaxed tracking-wide ml-9">
          Preserve your favorite content on the blockchain forever. Add metadata, 
          set it as public, and let others discover and vote on your curation.
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md animate-text-in shadow-sm" style={{animationDelay: "0.1s"}}>
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm font-serif text-green-800 tracking-wide">{successMessage}</p>
              <p className="text-xs font-serif text-green-600 mt-1 tracking-wide">Redirecting to your evermark...</p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md animate-text-in shadow-sm" style={{animationDelay: "0.1s"}}>
          <div className="flex">
            <AlertCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm font-serif text-red-800 tracking-wide">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Form with notebook paper background */}
      <div className="bg-notebook-paper rounded-lg shadow-lg overflow-hidden border border-wood-light animate-text-in" style={{animationDelay: "0.2s"}}>
        <div className="relative">
          {/* Purple accent line (left edge) */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-warpcast/60"></div>
          
          <div className="p-6 ml-2">
            <CreateEvermark 
              onSuccess={handleSuccess} 
              onError={handleError} 
            />
          </div>
        </div>
      </div>

            {/* Help Section */}
      <div className="mt-8 bg-parchment-texture rounded-lg p-6 border border-wood-light animate-text-in shadow-md" style={{animationDelay: "0.3s"}}>
        <h3 className="text-sm font-medium font-serif text-ink-dark mb-3 tracking-tight flex items-center">
          <svg className="w-4 h-4 mr-2 text-warpcast" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          Tips for creating great Evermarks:
        </h3>
        
        <ul className="text-sm text-ink-light font-serif space-y-2 leading-relaxed tracking-wide pl-6">
          <li className="flex items-start">
            <span className="inline-block w-4 h-4 rounded-full bg-warpcast/10 text-warpcast-dark flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 text-xs">•</span>
            <span>Use descriptive titles that capture the essence of your content</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-4 h-4 rounded-full bg-warpcast/10 text-warpcast-dark flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 text-xs">•</span>
            <span>Add relevant tags to help others discover your evermark</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-4 h-4 rounded-full bg-warpcast/10 text-warpcast-dark flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 text-xs">•</span>
            <span>Include a brief description explaining why this content is valuable</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-4 h-4 rounded-full bg-warpcast/10 text-warpcast-dark flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 text-xs">•</span>
            <span>Auto-detect feature can extract metadata from URLs automatically</span>
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-warpcast/5 rounded border border-warpcast/10 text-xs font-serif text-ink-light italic">
          <p>Every Evermark is preserved on-chain, ensuring that important content remains accessible even if the original source disappears from the web.</p>
        </div>
      </div>
    </div>
  );
};

export default CreateEvermarkPage;
