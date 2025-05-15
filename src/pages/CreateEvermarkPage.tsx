// src/pages/CreateEvermarkPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CreateEvermark } from '../components/CreateEvermark';
import { AlertCircleIcon, BookmarkIcon } from 'lucide-react';
import { StatusMessage } from '../components/forms/StatusMessage';
import { HelpSection } from '../components/evermark/HelpSection';

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

      {/* Status Messages */}
      <StatusMessage 
        type="success" 
        message={successMessage} 
        subMessage="Redirecting to your evermark..."
        className="mb-6 animate-text-in"
      />
      
      <StatusMessage 
        type="error" 
        message={errorMessage}
        className="mb-6 animate-text-in"
      />

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
      <HelpSection className="mt-8 animate-text-in" style={{animationDelay: "0.3s"}} />
    </div>
  );
};

export default CreateEvermarkPage;