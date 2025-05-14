// src/pages/CreateEvermarkPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CreateEvermark } from '../components/CreateEvermark';
import { CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

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
      <div className="text-center py-12 bg-parchment-texture rounded-lg border border-wood-light">
        <AlertCircleIcon className="mx-auto h-12 w-12 text-wood" />
        <h3 className="mt-2 text-responsive-card-title text-ink-dark">Not authenticated</h3>
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
        <h1 className="text-responsive-title text-ink-dark">Create New Evermark</h1>
        <p className="mt-2 text-sm text-ink-light font-serif leading-relaxed tracking-wide">
          Preserve your favorite content on the blockchain forever. Add metadata, 
          set it as public, and let others discover and vote on your curation.
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md animate-text-in" style={{animationDelay: "0.1s"}}>
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-serif text-green-800 tracking-wide">{successMessage}</p>
              <p className="text-xs font-serif text-green-600 mt-1 tracking-wide">Redirecting to your evermark...</p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md animate-text-in" style={{animationDelay: "0.1s"}}>
          <div className="flex">
            <AlertCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-serif text-red-800 tracking-wide">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Form with notebook paper background */}
      <div className="bg-notebook-paper rounded-lg shadow-lg overflow-hidden border border-wood-light animate-text-in" style={{animationDelay: "0.2s"}}>
        <div className="p-6">
          <CreateEvermark 
            onSuccess={handleSuccess} 
            onError={handleError} 
          />
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-parchment-texture rounded-lg p-6 border border-wood-light animate-text-in" style={{animationDelay: "0.3s"}}>
        <h3 className="text-sm font-medium font-serif text-ink-dark mb-3 tracking-tight">Tips for creating great Evermarks:</h3>
        <ul className="text-sm text-ink-light font-serif space-y-2 leading-relaxed tracking-wide">
          <li>• Use descriptive titles that capture the essence of your content</li>
          <li>• Add relevant tags to help others discover your evermark</li>
          <li>• Include a brief description explaining why this content is valuable</li>
          <li>• Auto-detect feature can extract metadata from URLs automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateEvermarkPage;
