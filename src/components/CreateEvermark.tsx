// src/components/CreateEvermark.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvermarks } from '../hooks/useEvermarks';
import { ContentType, EvermarkFormData } from '../types';
import { metadataService } from '../services/metadata/MetadataService';

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

  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tags,
    }));
  };

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
      <div className="mb-6">
        <label className="block text-sm font-serif font-medium text-ink-dark mb-2">
          Source URL (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass bg-parchment-light bg-opacity-80 font-serif"
            placeholder="https://example.com/article"
          />
          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={!sourceUrl || autoDetecting}
            className="px-4 py-2 bg-brass text-ink-dark rounded-md hover:bg-brass-dark disabled:opacity-50 font-serif shadow-sm"
          >
            {autoDetecting ? 'Searching...' : 'Auto-Detect'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Type */}
        <div>
          <label className="block text-sm font-serif font-medium text-ink-dark mb-2">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass bg-parchment-light bg-opacity-80 font-serif appearance-none"
          >
            <option value={ContentType.WEBSITE}>Website</option>
            <option value={ContentType.ARTICLE}>Article</option>
            <option value={ContentType.BOOK}>Book</option>
            <option value={ContentType.VIDEO}>Video</option>
            <option value={ContentType.AUDIO}>Audio</option>
            <option value={ContentType.DOCUMENT}>Document</option>
            <option value={ContentType.OTHER}>Other</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-serif font-medium text-ink-dark mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass bg-parchment-light bg-opacity-80 font-serif"
            placeholder="Enter the title of this content"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-serif font-medium text-ink-dark mb-2">
            Author
          </label>
          <input
            type="text"
            name="author"
            value={formData.author || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass bg-parchment-light bg-opacity-80 font-serif"
            placeholder="Who created this content?"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-serif font-medium text-ink-dark mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass bg-parchment-light bg-opacity-80 font-serif"
            placeholder="Briefly describe why this is worth preserving"
          />
        </div>

        {/* Type-specific fields */}
        {contentType === ContentType.BOOK && (
          <>
            <div>
              <label className="block text-sm font-serif font-medium text-ink-dark mb-2">
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass bg-parchment-light bg-opacity-80 font-serif"
                placeholder="Enter ISBN number"
              />
            </div>
            <div>
              <label className="block text-sm font-serif font-medium text-ink-dark mb-2">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass bg-parchment-light bg-opacity-80 font-serif"
                placeholder="Publisher name"
              />
            </div>
          </>
        )}

        {contentType === ContentType.ARTICLE && (
          <div>
            <label className="block text-sm font-serif font-medium text-ink-dark mb-2">
              DOI
            </label>
            <input
              type="text"
              name="doi"
              value={formData.doi || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass bg-parchment-light bg-opacity-80 font-serif"
              placeholder="Digital Object Identifier (if available)"
            />
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-serif font-medium text-ink-dark mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags?.join(', ') || ''}
            onChange={handleTagsChange}
            placeholder="history, science, literature, etc."
            className="w-full px-3 py-2 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-brass bg-parchment-light bg-opacity-80 font-serif"
          />
          <p className="mt-1 text-xs text-ink-light font-serif">Separate tags with commas</p>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={creating || !isAuthenticated || !formData.title}
            className="w-full px-6 py-3 bg-wood text-parchment-light rounded-md hover:bg-wood-dark disabled:opacity-50 disabled:cursor-not-allowed font-serif font-medium shadow-md transition-colors"
          >
            {creating ? 'Creating Evermark...' : 'Add to Library Collection'}
          </button>
        </div>
      </form>
    </div>
  );
};