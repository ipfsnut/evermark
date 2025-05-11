import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvermarks } from '../hooks/useEvermarks';
import { useAuth } from '../hooks/useAuth';
import { 
  ExternalLinkIcon, 
  VoteIcon, 
  UserIcon, 
  CalendarIcon, 
  TagIcon,
  ArrowLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !selectedEvermark) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading evermark. Please try again.</p>
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
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Evermarks
        </Link>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">{selectedEvermark.title}</h1>
          <div className="flex items-center mt-4 text-blue-100">
            <UserIcon className="w-4 h-4 mr-1" />
            <span className="mr-4">by {selectedEvermark.author}</span>
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>{new Date(selectedEvermark.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          {selectedEvermark.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600">{selectedEvermark.description}</p>
            </div>
          )}

          {/* External Link */}
          {selectedEvermark.metadata?.external_url && (
            <div className="mb-6">
              <a
                href={selectedEvermark.metadata.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLinkIcon className="w-4 h-4 mr-1" />
                View Original Content
              </a>
            </div>
          )}

          {/* Tags */}
          {selectedEvermark.metadata?.tags && selectedEvermark.metadata.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {selectedEvermark.metadata.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
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
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vote on this Evermark</h2>
              
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="number"
                  value={voteAmount}
                  onChange={(e) => setVoteAmount(e.target.value)}
                  placeholder="Amount to vote"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleVote}
                  disabled={voting || !voteAmount}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {voting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <VoteIcon className="w-4 h-4 mr-2" />
                  )}
                  Vote
                </button>
              </div>

              {voteError && (
                <p className="text-sm text-red-600 mb-4">{voteError}</p>
              )}

              <div className="text-sm text-gray-600">
                Total votes: <span className="font-medium">{totalVotes}</span>
              </div>
            </div>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <div className="border-t pt-6 mt-6">
              <p className="text-sm text-green-600">You own this Evermark</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Blockchain Info</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Token ID</dt>
            <dd className="text-gray-900 font-mono">{selectedEvermark.metadata?.tokenId}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Contract</dt>
            <dd className="text-gray-900 font-mono">Evermark NFT</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd className="text-gray-900">
              {selectedEvermark.verified ? (
                <span className="text-green-600">Verified</span>
              ) : (
                <span className="text-gray-500">Not Verified</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default EvermarkDetailPage;