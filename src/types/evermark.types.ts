export interface Evermark {
    id: string;
    title: string;
    author: string;
    description: string | null;
    userId: string; // Maps to user_id in database
    verified: boolean;
    createdAt: Date; // Convert from string in database
    updatedAt: Date; // Convert from string in database
    metadata: EvermarkMetadata;
  }
  
  export interface EvermarkMetadata {
    type: ContentType;
    external_url?: string;
    image?: string;
    tags?: string[];
    
    // Type-specific fields
    isbn?: string;
    doi?: string;
    publisher?: string;
    publish_date?: string;
    language?: string;
    page_count?: number;
    journal?: string;
    site_name?: string;
    
    // NFT metadata
    tokenId?: string;
    metadataUri?: string;
    owner?: string;
    
    // Additional metadata
    [key: string]: any;
  }