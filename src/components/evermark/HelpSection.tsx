import React, { CSSProperties } from 'react';

interface HelpSectionProps {
  className?: string;
  style?: CSSProperties;
}

export const HelpSection: React.FC<HelpSectionProps> = ({ className = '', style }) => {
  return (
    <div className={`bg-parchment-texture rounded-lg p-6 border border-wood-light shadow-md ${className}`} style={style}>
      <h3 className="text-sm font-medium font-serif text-ink-dark mb-3 tracking-tight flex items-center">
        <svg className="w-4 h-4 mr-2 text-warpcast" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
        Tips for creating great Evermarks:
      </h3>
      
      <ul className="text-sm text-ink-light font-serif space-y-2 leading-relaxed tracking-wide pl-6">
        <li className="flex items-start">
          <span className="inline-block w-4 h-4 rounded-full bg-warpcast/10 text-warpcast-dark flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 text-xs">•</span>
          <span>Use descriptive titles that capture the essence of your content</span>
        </li>
        <li className="flex items-start">
          <span className="inline-block w-4 h-4 rounded-full bg-warpcast/10 text-warpcast-dark flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 text-xs">•</span>
          <span>Add relevant tags to help others discover your evermark</span>
        </li>
        <li className="flex items-start">
          <span className="inline-block w-4 h-4 rounded-full bg-warpcast/10 text-warpcast-dark flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 text-xs">•</span>
          <span>Include a brief description explaining why this content is valuable</span>
        </li>
        <li className="flex items-start">
          <span className="inline-block w-4 h-4 rounded-full bg-warpcast/10 text-warpcast-dark flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 text-xs">•</span>
          <span>Auto-detect feature can extract metadata from URLs automatically</span>
        </li>
      </ul>
      
      <div className="mt-4 p-3 bg-warpcast/5 rounded border border-warpcast/10 text-xs font-serif text-ink-light italic">
        <p>Every Evermark is preserved on-chain, ensuring that important content remains accessible even if the original source disappears from the web.</p>
      </div>
    </div>
  );
};