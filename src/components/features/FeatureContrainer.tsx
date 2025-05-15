// src/components/features/FeatureContainer.tsx
import React, { useEffect } from 'react';
import { useContractFeature } from '../../hooks/useContractFeature';
import { StatusMessage } from '../forms/StatusMessage';

export const FeatureContainer: React.FC = () => {
  const { data, loading, error, fetchData } = useContractFeature();
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  if (loading && !data) {
    return (
      <div className="animate-pulse p-6 bg-parchment-texture rounded-lg">
        <div className="h-6 bg-wood-light/20 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-wood-light/20 rounded w-full mb-2"></div>
        <div className="h-4 bg-wood-light/20 rounded w-5/6"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <StatusMessage
        type="error"
        message="Failed to load data"
        subMessage={error}
      />
    );
  }
  
  return (
    <div className="bg-parchment-texture p-6 rounded-lg shadow-md animate-text-in">
      {/* Feature-specific content here */}
    </div>
  );
};