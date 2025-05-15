import React from 'react';
import { ContentType } from '../../types';
import { StyledInput } from '../forms/StyledInput';

interface ContentTypeFieldsProps {
  contentType: ContentType;
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const ContentTypeFields: React.FC<ContentTypeFieldsProps> = ({
  contentType,
  formData,
  onChange,
  className = ''
}) => {
  // If content type doesn't have special fields, don't render anything
  if (![ContentType.BOOK, ContentType.ARTICLE].includes(contentType)) {
    return null;
  }
  
  return (
    <div className={`space-y-4 p-4 bg-warpcast/5 rounded-md border border-warpcast/10 ${className}`}>
      <h3 className="text-sm font-medium font-serif text-ink-dark">
        {contentType === ContentType.BOOK ? 'Book-specific Information' : 'Article-specific Information'}
      </h3>
      
      {contentType === ContentType.BOOK && (
        <>
          <StyledInput
            id="isbn"
            name="isbn"
            label="ISBN"
            value={formData.isbn || ''}
            onChange={onChange}
            placeholder="Enter ISBN number"
          />
          
          <StyledInput
            id="publisher"
            name="publisher"
            label="Publisher"
            value={formData.publisher || ''}
            onChange={onChange}
            placeholder="Publisher name"
          />
        </>
      )}
      
      {contentType === ContentType.ARTICLE && (
        <StyledInput
          id="doi"
          name="doi"
          label="DOI"
          value={formData.doi || ''}
          onChange={onChange}
          placeholder="Digital Object Identifier (if available)"
        />
      )}
      
      {/* Content Type Specific Tips */}
      <div className="mt-2 bg-parchment-light rounded-lg p-3 border border-wood-light/50 shadow-sm">
        <h4 className="text-sm font-medium font-serif text-ink-dark mb-2">
          {contentType === ContentType.BOOK ? 'Book Preservation Tips:' : 'Article Preservation Tips:'}
        </h4>
        <p className="text-xs text-ink-light font-serif leading-relaxed">
          {contentType === ContentType.BOOK 
            ? 'Including the ISBN helps others locate the exact edition you are referencing. If available, add the publisher and publication year to create a complete record.'
            : 'For academic articles, the DOI provides a permanent identifier. Adding the journal name and publication date helps create a complete citation.'}
        </p>
      </div>
    </div>
  );
};