// src/pages/CreateEvermarkPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateEvermark } from '../components/CreateEvermark'; 
import { useAuth } from '../hooks/useAuth';

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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Status Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start animate-text-in">
          <span className="text-purple-500 mr-3">✓</span>
          <div>
            <p className="text-purple-700 font-serif">{successMessage}</p>
            <p className="text-xs text-purple-600 font-serif mt-1">Redirecting to your evermark...</p>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start animate-text-in">
          <span className="text-amber-800 mr-3">⚠️</span>
          <p className="text-amber-800 font-serif">{errorMessage}</p>
        </div>
      )}

      <CreateEvermark onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default CreateEvermarkPage;