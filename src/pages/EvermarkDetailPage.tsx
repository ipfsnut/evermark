import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvermarks } from '../hooks/useEvermarks';
import { useAuth } from '../hooks/useAuth';
import { 
  ExternalLinkIcon, 
  BookOpenIcon, 
  UserIcon, 
  CalendarIcon, 
  TagIcon,
  ArrowLeftIcon,
  VoteIcon
} from 'lucide-react';

const EvermarkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchEvermark, selectedEvermark, selectEvermark, loading, error, vote, getVotes } = useEvermarks();
  const { isAuthenticated, user } = useAuth();
  const [voteAmount, setVoteAmount] = useState('');
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [userVotes, setUserVotes] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    if (id) {
      const loadEvermark = async () => {
        const evermark = await fetchEvermark(id);
        if (evermark) {
          selectEvermark(evermark);
          
          // Load voting info if user is authenticated
          if (isAuthenticated && user) {
            try {
              const votes = await getVotes(id);
              setTotalVotes(Number(votes));
              // You'd need to implement getUserVotes in your service
              // setUserVotes(await getUserVotes(id, user.walletAddress));
            } catch (err) {
              console.error('Failed to load voting info:', err);
            }
          }
        }
      };
      
      loadEvermark();
    }

    return () => {
      selectEvermark(null);
    };
  }, [id, isAuthenticated, user]);

  const handleVote = async () => {
    if (!voteAmount || !selectedEvermark) return;
    
    setVoting(true);
    setVoteError('');
    
    try {
      const result = await vote(selectedEvermark.id, voteAmount);
      if (result) {
        // Refresh vote counts
        const newTotalVotes = await getVotes(selectedEvermark.id);
        setTotalVotes(Number(newTotalVotes));
        setVoteAmount('');
      }
    } catch (error: any) {
      setVoteError(error.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood"></div>
      </div>
    );
  }

  if (error || !selectedEvermark) {
    return (
      <div className="text-center py-12 bg-parchment-texture rounded-lg">
        <p className="text-red-600 font-serif leading-relaxed">Error loading evermark. Please try again.</p>
        <Link to="/" className="mt-4 inline-block text-wood hover:text-wood-dark font-serif transition-colors duration-200">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOwner = user?.walletAddress === selectedEvermark.userId;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-wood hover:text-wood-dark transition-colors font-serif"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Catalog
        </Link>
      </div>

      {/* Main Content */}
      <div className="bg-parchment-texture rounded-lg shadow-lg overflow-hidden border border-wood-light">
        {/* Header */}
        <div className="bg-wood-texture px-6 py-8 text-parchment-light relative">
          <div className="relative z-10 animate-text-in">
            <h1 className="text-responsive-title text-parchment-light mb-2">{selectedEvermark.title}</h1>
            <div className="flex items-center mt-4 text-parchment">
              <UserIcon className="w-4 h-4 mr-1" />
              <span className="mr-4 font-serif tracking-wide">by {selectedEvermark.author}</span>
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span className="font-serif tracking-wide">{new Date(selectedEvermark.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          {selectedEvermark.description && (
            <div className="mb-6 animate-text-in" style={{animationDelay: "0.1s"}}>
              <h2 className="text-responsive-card-title text-ink-dark mb-2">Description</h2>
              <p className="text-ink-light font-serif leading-relaxed">{selectedEvermark.description}</p>
            </div>
          )}

          {/* External Link */}
          {selectedEvermark.metadata?.external_url && (
            <div className="mb-6 animate-text-in" style={{animationDelay: "0.2s"}}>
              <a
                href={selectedEvermark.metadata.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-brass hover:text-brass-dark transition-colors font-serif"
              >
                <ExternalLinkIcon className="w-4 h-4 mr-1" />
                View Original Content
              </a>
            </div>
          )}

          {/* Tags */}
          {selectedEvermark.metadata?.tags && selectedEvermark.metadata.tags.length > 0 && (
            <div className="mb-6 animate-text-in" style={{animationDelay: "0.3s"}}>
              <h2 className="text-responsive-card-title text-ink-dark mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {selectedEvermark.metadata.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-serif bg-parchment text-ink-dark border border-wood-light tracking-wide"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Voting Section */}
          {isAuthenticated && !isOwner && (
            <div className="border-t border-wood-light pt-6 mt-6 animate-text-in" style={{animationDelay: "0.4s"}}>
              <h2 className="text-responsive-card-title text-ink-dark mb-4">Vote on this Evermark</h2>
              
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="number"
                  value={voteAmount}
                  onChange={(e) => setVoteAmount(e.target.value)}
                  placeholder="Amount to vote"
                  className="flex-1 px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass font-serif bg-parchment-light bg-opacity-80"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleVote}
                  disabled={voting || !voteAmount}
                  className="px-6 py-2 bg-brass text-ink-dark rounded-md hover:bg-brass-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-serif transition-colors duration-200"
                >
                  {voting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ink-dark mr-2"></div>
                  ) : (
                    <VoteIcon className="w-4 h-4 mr-2" />
                  )}
                  Vote
                </button>
              </div>

              {voteError && (
                <p className="text-sm text-red-600 mb-4 font-serif leading-relaxed">{voteError}</p>
              )}

              <div className="text-sm text-ink-light font-serif tracking-wide">
                Total votes: <span className="font-medium">{totalVotes}</span>
              </div>
            </div>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <div className="border-t border-wood-light pt-6 mt-6 animate-text-in" style={{animationDelay: "0.4s"}}>
              <p className="text-sm text-green-600 font-serif tracking-wide">You own this Evermark</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-index-card rounded-lg p-4 border border-wood-light animate-text-in" style={{animationDelay: "0.5s"}}>
        <h3 className="text-sm font-serif font-medium text-ink-dark mb-2 tracking-tight">Catalog Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-serif">
          <div>
            <dt className="text-ink-light tracking-wide">Token ID</dt>
            <dd className="text-ink-dark font-mono">{selectedEvermark.metadata?.tokenId}</dd>
          </div>
          <div>
            <dt className="text-ink-light tracking-wide">Contract</dt>
            <dd className="text-ink-dark">Evermark NFT</dd>
          </div>
          <div>
            <dt className="text-ink-light tracking-wide">Status</dt>
            <dd className="text-ink-dark">
              {selectedEvermark.verified ? (
                <span className="text-green-600">Verified</span>
              ) : (
                <span className="text-ink-light">Not Verified</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default EvermarkDetailPage;
