import { ContentType } from '../../types/evermark.types';

class MetadataService {
  // Detect content type from a source
  detectContentType(source: string): ContentType {
    // Check if it's a DOI
    if (source.startsWith('10.') || source.includes('doi.org')) {
      return ContentType.ARTICLE;
    }
    
    // Check if it's an ISBN
    const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/i;
    if (isbnRegex.test(source)) {
      return ContentType.BOOK;
    }
    
    // Default to website for URLs
    if (source.startsWith('http') || source.includes('www.')) {
      return ContentType.WEBSITE;
    }
    
    // Default
    return ContentType.WEBSITE;
  }
  
  // Create metadata object
  createMetadata(contentType: ContentType, data: any): any {
    const baseMetadata = {
      type: contentType,
      title: data.title,
      description: data.description,
      external_url: data.external_url,
      tags: data.tags || [],
    };
    
    switch (contentType) {
      case ContentType.BOOK:
        return {
          ...baseMetadata,
          author: data.author,
          isbn: data.isbn,
          publisher: data.publisher,
          publish_date: data.publish_date,
        };
      case ContentType.ARTICLE:
        return {
          ...baseMetadata,
          author: data.author,
          doi: data.doi,
          journal: data.journal,
          publish_date: data.publish_date,
        };
      case ContentType.WEBSITE:
        return {
          ...baseMetadata,
          url: data.url,
          site_name: data.site_name,
          author: data.author,
        };
      default:
        return baseMetadata;
    }
  }
  
  // Extract metadata from external source
  async extractMetadata(source: string): Promise<{ contentType: ContentType; metadata: any }> {
    const contentType = this.detectContentType(source);
    
    // Try to extract metadata based on type
    try {
      if (contentType === ContentType.ARTICLE && source.includes('doi.org')) {
        // Extract from DOI
        const doi = source.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i)?.[0] || source;
        const response = await fetch(`https://api.crossref.org/works/${doi}`);
        const data = await response.json();
        
        if (data?.message) {
          const article = data.message;
          return {
            contentType,
            metadata: {
              title: article.title?.[0] || '',
              author: article.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`).join(', ') || '',
              doi,
              journal: article['container-title']?.[0] || '',
              publish_date: article.created?.['date-time'] || '',
            },
          };
        }
      }
      
      // For other content types or if DOI extraction fails
      if (source.startsWith('http')) {
        // Use OpenGraph extraction or similar service
        const response = await fetch('/.netlify/functions/extract-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: source }),
        });
        
        const data = await response.json();
        return {
          contentType,
          metadata: {
            title: data.title || '',
            description: data.description || '',
            author: data.author || '',
            external_url: source,
          },
        };
      }
    } catch (error) {
      console.error('Metadata extraction failed:', error);
    }
    
    // Return minimal metadata if extraction fails
    return {
      contentType,
      metadata: {
        title: '',
        external_url: source,
      },
    };
  }
}

export const metadataService = new MetadataService();