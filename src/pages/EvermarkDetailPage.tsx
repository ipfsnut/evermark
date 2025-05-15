import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvermarks } from '../hooks/useEvermarks';
import { useAuth } from '../hooks/useAuth';
import { VotingPanel } from '../components/voting/VotingPanel';
import { VotingHistory } from '../components/voting/VotingHistory';
import { VotePowerAllocation } from '../components/voting/VotePowerAllocation';
import { CycleInfoBar } from '../components/voting/CycleInfoBar';
import { 
  ExternalLinkIcon, 
  BookOpenIcon, 
  UserIcon, 
  CalendarIcon, 
  TagIcon,
  ArrowLeftIcon,
} from 'lucide-react';

const EvermarkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchEvermark, selectedEvermark, selectEvermark, loading, error } = useEvermarks();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (id) {
      const loadEvermark = async () => {
        const evermark = await fetchEvermark(id);
        if (evermark) {
          selectEvermark(evermark);
        }
      };
      
      loadEvermark();
    }

    return () => {
      selectEvermark(null);
    };
  }, [id, isAuthenticated, user, fetchEvermark, selectEvermark]);  // Added missing dependencies

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
      <div className="mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-wood hover:text-wood-dark transition-colors font-serif"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Catalog
        </Link>
      </div>

      {/* Voting Cycle Information Bar */}
      {isAuthenticated && (
        <CycleInfoBar />
      )}

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
            <div className="mb-6 animate-text-in">
              <h2 className="text-responsive-card-title text-ink-dark mb-2">Description</h2>
              <p className="text-ink-light font-serif leading-relaxed">{selectedEvermark.description}</p>
            </div>
          )}

          {/* External Link */}
          {selectedEvermark.metadata?.external_url && (
            <div className="mb-6 animate-text-in">
              
                href={selectedEvermark.metadata.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-brass hover:text-brass-dark transition-colors font-serif"
              <a>
                <ExternalLinkIcon className="w-4 h-4 mr-1" />
                View Original Content
              </a>
            </div>
          )}

          {/* Tags */}
          {selectedEvermark.metadata?.tags && selectedEvermark.metadata.tags.length > 0 && (
            <div className="mb-6 animate-text-in">
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
        </div>
      </div>

      {/* Voting Section (only if authenticated) */}
      {isAuthenticated && (
        <div className="mt-8">
          {/* Desktop: Side-by-side layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-6">
            <div>
              <VotingPanel evermarkId={selectedEvermark.id} isOwner={isOwner} />
              <VotingHistory evermarkId={selectedEvermark.id} />
            </div>
            <div>
              <VotePowerAllocation />
            </div>
          </div>
          
          {/* Mobile: Stacked layout */}
          <div className="md:hidden space-y-6">
            <VotingPanel evermarkId={selectedEvermark.id} isOwner={isOwner} />
            <VotePowerAllocation />
            <VotingHistory evermarkId={selectedEvermark.id} />
          </div>
        </div>
      )}

      {/* Not Authenticated Message */}
      {!isAuthenticated && (
        <div className="mt-8 bg-parchment-texture p-6 rounded-lg border border-wood-light text-center">
          <p className="font-serif text-ink-dark mb-2">Connect your wallet to vote on this Evermark</p>
          <p className="text-sm font-serif text-ink-light">
            Voting helps valuable content rise to the top of the leaderboard
          </p>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 bg-index-card rounded-lg p-4 border border-wood-light animate-text-in">
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