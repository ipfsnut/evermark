// src/pages/VotingHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useVoting } from '../hooks/useVoting';
import { useEvermarks } from '../hooks/useEvermarks';
import { PageContainer } from '../components/layout/PageContainer';

const VotingHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchEvermark } = useEvermarks();
  const { getUserVotesForEvermark } = useVoting();
  const [votedEvermarks, setVotedEvermarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Implementation to fetch all voted evermarks
    // This will require retrieving vote events from the contract
    // and then fetching details for each evermark
  }, [user]);
  
  return (
    <PageContainer
      title="Your Voting History"
      description="View all the Evermarks you've supported"
    >
      {/* Implementation here */}
    </PageContainer>
  );
};

export default VotingHistoryPage;// src/pages/VotingHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useVoting } from '../hooks/useVoting';
import { useEvermarks } from '../hooks/useEvermarks';
import { PageContainer } from '../components/layout/PageContainer';

const VotingHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchEvermark } = useEvermarks();
  const { getUserVotesForEvermark } = useVoting();
  const [votedEvermarks, setVotedEvermarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Implementation to fetch all voted evermarks
    // This will require retrieving vote events from the contract
    // and then fetching details for each evermark
  }, [user]);
  
  return (
    <PageContainer
      title="Your Voting History"
      description="View all the Evermarks you've supported"
    >
      {/* Implementation here */}
    </PageContainer>
  );
};

export default VotingHistoryPage;