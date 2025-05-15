import React from 'react';
import { SearchIcon } from 'lucide-react';
import { StyledInput } from '../forms/StyledInput';
import { StyledButton } from '../forms/StyledButton';

interface UrlDetectionSectionProps {
  sourceUrl: string;
  onSourceUrlChange: (url: string) => void;
  onAutoDetect: () => void;
  isAutoDetecting: boolean;
  className?: string;
}

export const UrlDetectionSection: React.FC<UrlDetectionSectionProps> = ({
  sourceUrl,
  onSourceUrlChange,
  onAutoDetect,
  isAutoDetecting,
  className = ''
}) => {
  return (
    <div className={`bg-parchment-texture p-5 rounded-lg border border-wood-light/30 shadow-sm ${className}`}>
      <StyledInput
        id="source-url"
        label="Source URL (optional)"
        value={sourceUrl}
        onChange={(e) => onSourceUrlChange(e.target.value)}
        placeholder="https://example.com/article"
        hint="Enter a URL, DOI, or ISBN to auto-detect metadata"
        containerClassName="mb-3"
      />
      
      <div className="flex justify-end">
        <StyledButton
          type="button"
          onClick={onAutoDetect}
          disabled={!sourceUrl || isAutoDetecting}
          variant="primary"
          size="md"
          isLoading={isAutoDetecting}
          icon={<SearchIcon className="h-4 w-4" />}
        >
          {isAutoDetecting ? 'Detecting...' : 'Auto-Detect'}
        </StyledButton>
      </div>
    </div>
  );
};