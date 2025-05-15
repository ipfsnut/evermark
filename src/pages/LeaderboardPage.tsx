// src/pages/LeaderboardPage.tsx
import React, { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { BookOpenIcon, TrophyIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { StatusMessage } from '../components/forms/StatusMessage';
import { StyledButton } from '../components/forms/StyledButton';

const LeaderboardPage: React.FC = () => {
  const { 
    currentWeek,
    topBookmarks,
    loading,
    error,
    isFinalized,
    fetchTopBookmarks
  } = useLeaderboard();
  
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  
  const handlePreviousWeek = () => {
    if (selectedWeek > 1) {
      const newWeek = selectedWeek - 1;
      setSelectedWeek(newWeek);
      fetchTopBookmarks(newWeek);
    }
  };
  
  const handleNextWeek = () => {
    if (selectedWeek < currentWeek) {
      const newWeek = selectedWeek + 1;
      setSelectedWeek(newWeek);
      fetchTopBookmarks(newWeek);
    }
  };
  
  return (
    <PageContainer
      title="Evermark Leaderboard"
      description="The most valued content in the library, ranked by community votes"
      icon={<TrophyIcon className="h-7 w-7 text-warpcast" />}
    >
      {/* Week navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-responsive-subtitle text-ink-dark dark:text-parchment-light animate-text-in">
          Week {selectedWeek} {isFinalized ? '(Finalized)' : '(In Progress)'}
        </h2>
        
        <div className="flex space-x-2">
          <StyledButton
            onClick={handlePreviousWeek}
            disabled={selectedWeek <= 1}
            size="sm"
            variant="secondary"
            icon={<ChevronLeftIcon className="h-4 w-4" />}
          >
            Previous
          </StyledButton>
          
          <StyledButton
            onClick={handleNextWeek}
            disabled={selectedWeek >= currentWeek}
            size="sm"
            variant="secondary"
            icon={<ChevronRightIcon className="h-4 w-4" />}
            iconPosition="right"
          >
            Next
          </StyledButton>
        </div>
      </div>
      
      {/* Error handling */}
      {error && (
        <StatusMessage
          type="error"
          message="Failed to load leaderboard"
          subMessage={error}
        />
      )}
      
      {/* Leaderboard content */}
      {loading ? (
        <div className="bg-parchment-texture rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-6 bg-wood-light/20 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-wood-light/20 rounded w-full mb-2"></div>
          <div className="h-4 bg-wood-light/20 rounded w-5/6"></div>
        </div>
      ) : (
        topBookmarks.length > 0 ? (
          <LeaderboardTable bookmarks={topBookmarks} />
        ) : (
          <div className="text-center py-12 bg-parchment-texture rounded-lg">
            <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
            <h3 className="text-responsive-card-title text-ink-dark font-serif">No Results Yet</h3>
            <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide max-w-md mx-auto">
              {selectedWeek === currentWeek
                ? "This week's voting is still in progress. Check back later for results."
                : "There are no records for this week."}
            </p>
          </div>
        )
      )}
    </PageContainer>
  );
};

export default LeaderboardPage;