// src/components/CreateEvermark.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvermarks } from '../hooks/useEvermarks';
import { ContentType, EvermarkFormData } from '../types';
import { metadataService } from '../services/metadata/MetadataService';
import { StyledInput } from '../components/forms/StyledInput';
import { StyledTextarea } from '../components/forms/StyledTextarea';
import { StyledSelect } from '../components/forms/StyledSelect';
import { StyledButton } from '../components/forms/StyledButton';
import { StyledTagInput } from '../components/forms/StyledTagInput';
import { SearchIcon, BookIcon, BookOpenIcon, FileTextIcon } from 'lucide-react';

interface CreateEvermarkProps {
  onSuccess?: (evermark: any) => void;
  onError?: (error: string) => void;
}

export const CreateEvermark: React.FC<CreateEvermarkProps> = ({ onSuccess, onError }) => {
  const { isAuthenticated } = useAuth();
  const { createEvermark, creating } = useEvermarks();
  const [autoDetecting, setAutoDetecting] = useState(false);
  
  // Form state
  const [sourceUrl, setSourceUrl] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.WEBSITE);
  const [formData, setFormData] = useState<EvermarkFormData>({
    title: '',
    author: '',
    description: '',
    external_url: '',
    tags: [],
  });

  // Auto-detect content metadata
  const handleAutoDetect = async () => {
    if (!sourceUrl) return;
    
    setAutoDetecting(true);
    try {
      const { contentType: detectedType, metadata } = await metadataService.extractMetadata(sourceUrl);
      setContentType(detectedType);
      setFormData(prev => ({
        ...prev,
        ...metadata,
        external_url: sourceUrl,
      }));
    } catch (error) {
      console.error('Auto-detection failed:', error);
      onError?.('Failed to auto-detect metadata. Please fill in manually.');
    } finally {
      setAutoDetecting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      onError?.('Please sign in to create an evermark');
      return;
    }

    try {
      const result = await createEvermark({
        contentType,
        sourceUrl,
        manualData: formData,
      });
      
      if (result) {
        onSuccess?.(result);
        // Reset form
        setFormData({
          title: '',
          author: '',
          description: '',
          external_url: '',
          tags: [],
        });
        setSourceUrl('');
      }
    } catch (error: any) {
      console.error('Error creating evermark:', error);
      onError?.(error.message || 'Failed to create evermark');
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tags
  const handleAddTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag],
    }));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove),
    }));
  };

  // Content type options for the dropdown
  const contentTypeOptions = [
    { value: ContentType.WEBSITE, label: 'Website' },
    { value: ContentType.ARTICLE, label: 'Article' },
    { value: ContentType.BOOK, label: 'Book' },
    { value: ContentType.VIDEO, label: 'Video' },
    { value: ContentType.AUDIO, label: 'Audio' },
    { value: ContentType.DOCUMENT, label: 'Document' },
    { value: ContentType.OTHER, label: 'Other' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 bg-parchment-light rounded-lg shadow">
        <p className="text-ink-light font-serif">Please sign in to create an evermark.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-serif font-bold text-ink-dark mb-6">Add to the Library Collection</h2>
      
      {/* URL Input with Auto-Detect */}
      <div className="mb-6 bg-parchment-texture p-5 rounded-lg border border-wood-light/30 shadow-sm">
        <StyledInput
          id="source-url"
          label="Source URL (optional)"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://example.com/article"
          hint="Enter a URL, DOI, or ISBN to auto-detect metadata"
          containerClassName="mb-3"
        />
        
        <div className="flex justify-end">
          <StyledButton
            type="button"
            onClick={handleAutoDetect}
            disabled={!sourceUrl || autoDetecting}
            variant="primary"
            size="md"
            isLoading={autoDetecting}
            icon={<SearchIcon className="h-4 w-4" />}
          >
            {autoDetecting ? 'Detecting...' : 'Auto-Detect'}
          </StyledButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type */}
        <StyledSelect
          id="content-type"
          label="Content Type"
          options={contentTypeOptions}
          value={contentType}
          onChange={(e) => setContentType(e.target.value as ContentType)}
          icon={
            contentType === ContentType.BOOK ? <BookIcon /> :
            contentType === ContentType.ARTICLE ? <FileTextIcon /> :
            <BookOpenIcon />
          }
        />

        {/* Title */}
        <StyledInput
          id="title"
          name="title"
          label="Title"
          value={formData.title}
          onChange={handleInputChange}
          required
          placeholder="Enter the title of this content"
        />

        {/* Author */}
        <StyledInput
          id="author"
          name="author"
          label="Author"
          value={formData.author || ''}
          onChange={handleInputChange}
          placeholder="Who created this content?"
        />

        {/* Description */}
        <StyledTextarea
          id="description"
          name="description"
          label="Description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={3}
          placeholder="Briefly describe why this is worth preserving"
        />

        {/* Type-specific fields */}
        {contentType === ContentType.BOOK && (
          <div className="space-y-4 p-4 bg-warpcast/5 rounded-md border border-warpcast/10">
            <h3 className="text-sm font-medium font-serif text-ink-dark">Book-specific Information</h3>
            
            <StyledInput
              id="isbn"
              name="isbn"
              label="ISBN"
              value={formData.isbn || ''}
              onChange={handleInputChange}
              placeholder="Enter ISBN number"
            />
            
            <StyledInput
              id="publisher"
              name="publisher"
              label="Publisher"
              value={formData.publisher || ''}
              onChange={handleInputChange}
              placeholder="Publisher name"
            />
          </div>
        )}

        {contentType === ContentType.ARTICLE && (
          <div className="space-y-4 p-4 bg-warpcast/5 rounded-md border border-warpcast/10">
            <h3 className="text-sm font-medium font-serif text-ink-dark">Article-specific Information</h3>
            
            <StyledInput
              id="doi"
              name="doi"
              label="DOI"
              value={formData.doi || ''}
              onChange={handleInputChange}
              placeholder="Digital Object Identifier (if available)"
            />
          </div>
        )}

        {/* Tags */}
        <StyledTagInput
          id="tags"
          label="Tags (comma-separated)"
          tags={formData.tags || []}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          hint="Add keywords to help others discover your evermark"
        />

        {/* Submit */}
        <div className="pt-4">
          <StyledButton
            type="submit"
            disabled={creating || !isAuthenticated || !formData.title}
            variant="primary"
            size="lg"
            isLoading={creating}
            className="w-full"
          >
            {creating ? 'Creating Evermark...' : 'Add to Library Collection'}
          </StyledButton>
        </div>
      </form>
    </div>
  );
};
