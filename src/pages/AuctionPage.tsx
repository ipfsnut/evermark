// src/pages/AuctionPage.tsx (skeleton)
import React, { useState, useEffect } from 'react';
import { useAuctions } from '../hooks/useAuctions';
import { PageContainer } from '../components/layout/PageContainer';
import { AuctionCard } from '../components/auction/AuctionCard';

const AuctionPage: React.FC = () => {
  const { activeAuctions, fetchActiveAuctions, loading, error } = useAuctions();
  
  useEffect(() => {
    fetchActiveAuctions();
  }, [fetchActiveAuctions]);
  
  return (
    <PageContainer
      title="Evermark Auctions"
      description="Buy and sell unique Evermarks through our marketplace"
    >
      {loading ? (
        <div className="loading-spinner" />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAuctions.map(auctionId => (
            <AuctionCard key={auctionId} auctionId={auctionId} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default AuctionPage;