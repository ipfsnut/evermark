// Export all types from one place
export * from './evermark.types';
export * from './user.types';
export * from './blockchain.types';
export * from './database.types';

// Common types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}