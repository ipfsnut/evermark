// Complete Evermark Types

export interface Evermark {
    id: string;
    title: string;
    author: string;
    description: string | null;
    userId: string;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
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
    
    // NFT metadata (optional)
    tokenId?: string;
    metadataUri?: string;
    owner?: string;
    
    // Additional metadata
    [key: string]: any;
  }
  
  export enum ContentType {
    BOOK = 'book',
    ARTICLE = 'article',
    WEBSITE = 'website',
    VIDEO = 'video',
    AUDIO = 'audio',
    DOCUMENT = 'document',
    OTHER = 'other'
  }
  
  export interface CreateEvermarkInput {
    contentType: ContentType;
    sourceUrl?: string;
    manualData?: Partial<EvermarkFormData>;
  }
  
  export interface EvermarkFormData {
    title: string;
    author?: string;
    description?: string;
    image?: string;
    external_url?: string;
    
    // Type-specific fields
    isbn?: string;
    doi?: string;
    publisher?: string;
    publish_date?: string;
    language?: string;
    page_count?: number;
    journal?: string;
    site_name?: string;
    tags?: string[];
  }
  
  // API Response Types
  export interface EvermarkResponse {
    success: boolean;
    evermark?: Evermark;
    error?: string;
  }
  
  export interface EvermarksListResponse {
    success: boolean;
    evermarks?: Evermark[];
    total?: number;
    page?: number;
    limit?: number;
    error?: string;
  }
  
  // Event Types
  export interface EvermarkEvent {
    type: 'created' | 'updated' | 'deleted' | 'transferred';
    evermark: Evermark;
    timestamp: number;
    transactionHash?: string;
  }
  
  // Metadata Extraction Types
  export interface MetadataExtractionResult {
    contentType: ContentType;
    metadata: Partial<EvermarkMetadata>;
    error?: string;
  }
  
  // Evermark Stats Types
  export interface EvermarkStats {
    totalEvermarks: number;
    verifiedEvermarks: number;
    userEvermarks: number;
    userStakes: number;
  }