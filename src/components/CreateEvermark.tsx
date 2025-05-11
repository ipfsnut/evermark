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
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">Please sign in to create an evermark.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Create Evermark</h2>
      
      {/* URL Input with Auto-Detect */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source URL (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/article"
          />
          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={!sourceUrl || autoDetecting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {autoDetecting ? 'Detecting...' : 'Auto-Detect'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type-specific fields */}
        {contentType === ContentType.BOOK && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {contentType === ContentType.ARTICLE && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DOI
            </label>
            <input
              type="text"
              name="doi"
              value={formData.doi || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags?.join(', ') || ''}
            onChange={handleTagsChange}
            placeholder="tag1, tag2, tag3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={creating || !isAuthenticated}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating Evermark...' : 'Create Evermark'}
          </button>
        </div>
      </form>
    </div>
  );
};