// src/components/EnhancedCreateEvermark.tsx
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
  
  // Tag input state
  const [tagInput, setTagInput] = useState('');

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
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag || (formData.tags || []).includes(tag)) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag],
    }));
    setTagInput('');
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove),
    }));
  };

  // Content type options for the dropdown
  const contentTypeOptions = [
    { value: ContentType.WEBSITE, label: 'Website', icon: '🌐' },
    { value: ContentType.BOOK, label: 'Book', icon: '📚' },
    { value: ContentType.ARTICLE, label: 'Article', icon: '📄' },
    { value: ContentType.VIDEO, label: 'Video', icon: '🎬' },
    { value: ContentType.AUDIO, label: 'Audio', icon: '🎵' },
    { value: ContentType.DOCUMENT, label: 'Document', icon: '📑' },
    { value: ContentType.OTHER, label: 'Other', icon: '📦' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 bg-amber-50/30 rounded-lg shadow-md border border-amber-200">
        <p className="text-gray-700 font-serif">Please sign in to create an evermark.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
          <span className="text-purple-600 text-xl">📚</span>
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">Create New Evermark</h1>
          <p className="text-sm text-gray-600 font-serif">Preserve valuable content on the blockchain forever</p>
        </div>
      </div>
      
      {/* Source URL with auto-detect */}
      <div className="rounded-xl border border-amber-200 shadow-sm bg-amber-50/30 mb-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-100"></div>
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🔗</span>
            Source URL
          </h2>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-3 rounded-md bg-white/80 border border-amber-200 shadow-inner font-serif text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={!sourceUrl || autoDetecting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-serif flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {autoDetecting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Detecting...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">🔍</span>
                  <span>Auto-Detect</span>
                </div>
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600 font-serif italic">
            Enter a URL to auto-detect title, author, and other metadata
          </p>
        </div>
      </div>
      
      {/* Main form fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Details */}
        <div className="rounded-xl border border-amber-200 shadow-md overflow-hidden">
          <div className="bg-amber-800 px-6 py-4 flex items-center">
            <span className="text-amber-50 mr-2">📖</span>
            <h2 className="text-lg font-serif font-semibold text-amber-50">Content Details</h2>
          </div>
          
          <div className="p-6 pt-8 bg-amber-50/30">
            {/* Content Type */}
            <div className="mb-6">
              <label className="block font-serif text-gray-800 text-sm mb-2 font-medium">
                Content Type
              </label>
              <div className="flex flex-wrap gap-2">
                {contentTypeOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setContentType(option.value)}
                    className={`px-4 py-2 rounded-md font-serif text-sm flex items-center transition-all ${
                      contentType === option.value
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white/60 text-gray-800 border border-amber-200 hover:bg-white/80'
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block font-serif text-gray-800 text-sm mb-2 font-medium">
                Title <span className="text-purple-600">*</span>
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-md bg-white/80 border border-amber-200 shadow-inner font-serif text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition-all"
                placeholder="Enter the title of this content"
              />
            </div>

            {/* Author */}
            <div className="mb-6">
              <label htmlFor="author" className="block font-serif text-gray-800 text-sm mb-2 font-medium">
                Author
              </label>
              <input
                id="author"
                name="author"
                value={formData.author || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-md bg-white/80 border border-amber-200 shadow-inner font-serif text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition-all"
                placeholder="Who created this content?"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block font-serif text-gray-800 text-sm mb-2 font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-md bg-white/80 border border-amber-200 shadow-inner font-serif text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
                placeholder="Briefly describe why this is worth preserving"
              />
            </div>

            {/* Book-specific fields */}
            {contentType === ContentType.BOOK && (
              <div className="mb-6 p-4 bg-purple-50 rounded-md border border-purple-100">
                <h3 className="font-serif font-medium text-gray-800 mb-4 text-sm flex items-center">
                  <span className="mr-2">📚</span>
                  Book Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="isbn" className="block font-serif text-gray-800 text-sm mb-2 font-medium">
                      ISBN
                    </label>
                    <input
                      id="isbn"
                      name="isbn"
                      value={formData.isbn || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-md bg-white/80 border border-amber-200 shadow-inner font-serif text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition-all"
                      placeholder="ISBN number"
                    />
                  </div>
                  <div>
                    <label htmlFor="publisher" className="block font-serif text-gray-800 text-sm mb-2 font-medium">
                      Publisher
                    </label>
                    <input
                      id="publisher"
                      name="publisher"
                      value={formData.publisher || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-md bg-white/80 border border-amber-200 shadow-inner font-serif text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition-all"
                      placeholder="Publisher name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Article-specific fields */}
            {contentType === ContentType.ARTICLE && (
              <div className="mb-6 p-4 bg-purple-50 rounded-md border border-purple-100">
                <h3 className="font-serif font-medium text-gray-800 mb-4 text-sm flex items-center">
                  <span className="mr-2">📄</span>
                  Article Details
                </h3>
                <div>
                  <label htmlFor="doi" className="block font-serif text-gray-800 text-sm mb-2 font-medium">
                    DOI
                  </label>
                  <input
                    id="doi"
                    name="doi"
                    value={formData.doi || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md bg-white/80 border border-amber-200 shadow-inner font-serif text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition-all"
                    placeholder="Digital Object Identifier (if available)"
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="mb-6">
              <label htmlFor="tags" className="block font-serif text-gray-800 text-sm mb-2 font-medium">
                Tags
              </label>
              <div className="p-3 bg-white/80 border border-amber-200 rounded-md min-h-16 shadow-inner">
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.tags || []).map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-serif bg-purple-100 text-gray-800 border border-purple-200"
                    >
                      <span className="mr-1">🏷️</span>
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-500 hover:text-purple-700 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center">
                  <input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add tags and press Enter"
                    className="flex-1 border-none shadow-none bg-transparent focus:outline-none focus:ring-0 font-serif text-sm text-gray-800"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddTag}
                    className="ml-2 text-purple-600 hover:text-purple-700"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-600 font-serif italic">
                Add keywords to help others discover your evermark
              </p>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={creating || !formData.title}
            className="px-6 py-3 bg-purple-600 text-white rounded-md font-medium font-serif hover:bg-purple-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center">
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Creating Evermark...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">📚</span>
                  <span>Add to Library Collection</span>
                </>
              )}
            </div>
          </button>
        </div>
      </form>
      
      {/* Help Section */}
      <div className="mt-10 p-5 bg-amber-50/30 rounded-lg border border-amber-200 shadow-sm">
        <h3 className="text-sm font-serif font-medium text-gray-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Tips for creating great Evermarks:
        </h3>
        
        <ul className="space-y-2 text-sm font-serif text-gray-700">
          <li className="flex items-start">
            <span className="mr-2 text-amber-800">•</span>
            <span>Use descriptive titles that capture the essence of your content</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-amber-800">•</span>
            <span>Add relevant tags to help others discover your evermark</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-amber-800">•</span>
            <span>Include a brief description explaining why this content is valuable</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-amber-800">•</span>
            <span>The auto-detect feature can extract metadata from URLs automatically</span>
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-100 text-xs font-serif text-gray-700 italic">
          <p>Every Evermark is preserved on-chain, ensuring that important content remains accessible even if the original source disappears from the web.</p>
        </div>
      </div>
    </div>
  );
};