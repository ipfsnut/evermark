// src/components/leaderboard/LeaderboardTable.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BookmarkRank } from '../../types/blockchain.types';
import { formatEther } from '../../services/blockchain';
import { TrophyIcon } from 'lucide-react';

interface LeaderboardTableProps {
  bookmarks: BookmarkRank[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ bookmarks }) => {
  return (
    <div className="bg-parchment-texture rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-wood-texture">
          <tr>
            <th className="py-3 px-4 text-left text-parchment-light font-serif tracking-wide text-sm">Rank</th>
            <th className="py-3 px-4 text-left text-parchment-light font-serif tracking-wide text-sm">Evermark ID</th>
            <th className="py-3 px-4 text-left text-parchment-light font-serif tracking-wide text-sm">Votes</th>
            <th className="py-3 px-4 text-right text-parchment-light font-serif tracking-wide text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wood-light/20">
          {bookmarks.map((bookmark, index) => (
            <tr 
              key={bookmark.tokenId.toString()} 
              className="hover:bg-wood-light/5 transition-colors animate-text-in"
              style={{animationDelay: `${index * 0.05}s`}}
            >
              <td className="py-4 px-4 font-serif">
                <div className="flex items-center">
                  {index < 3 ? (
                    <div className={`p-1 rounded-full mr-2 ${
                      index === 0 ? 'bg-amber-300' : 
                      index === 1 ? 'bg-gray-200' : 
                      'bg-amber-700'
                    }`}>
                      <TrophyIcon className="h-4 w-4 text-ink-dark" />
                    </div>
                  ) : (
                    <span className="w-6 h-6 flex items-center justify-center mr-2 font-mono text-sm">{index + 1}</span>
                  )}
                  <span className="text-ink-dark">{bookmark.rank}</span>
                </div>
              </td>
              <td className="py-4 px-4 font-serif">
                <span className="text-ink-dark">#{bookmark.tokenId.toString()}</span>
              </td>
              <td className="py-4 px-4 font-serif">
                <span className="text-ink-dark">{formatEther(bookmark.votes)}</span>
              </td>
              <td className="py-4 px-4 font-serif text-right">
                <Link 
                  to={`/evermark/${bookmark.tokenId.toString()}`}
                  className="text-warpcast hover:text-warpcast-dark transition-colors"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};