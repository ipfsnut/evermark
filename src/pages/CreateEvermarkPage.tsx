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
      <div className="text-center py-12">
        <AlertCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Not authenticated</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please connect your wallet to create an evermark.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Evermark</h1>
        <p className="mt-2 text-sm text-gray-600">
          Preserve your favorite content on the blockchain forever. Add metadata, 
          set it as public, and let others discover and vote on your curation.
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
              <p className="text-xs text-green-600 mt-1">Redirecting to your evermark...</p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      <CreateEvermark 
        onSuccess={handleSuccess} 
        onError={handleError} 
      />

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Tips for creating great Evermarks:</h3>
        <ul className="text-sm text-gray-600 space-y-2">
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