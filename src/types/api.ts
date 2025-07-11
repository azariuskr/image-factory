export interface ImageUploadResult {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  folder: string;
  uploadedAt: string;
  eTag: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface BatchUploadResult {
  successful: ImageUploadResult[];
  errors: Array<{
    fileName: string;
    error: string;
  }>;
}

export interface ImageResult {
  data: ArrayBuffer;
  contentType: string;
  fileName: string;
  eTag: string;
  lastModified: string;
}

export interface GalleryResponse {
  images: string[]; // Array of image URLs
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

// Enhanced GalleryImage with better metadata support
export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
  folder?: string;
  uploadedAt?: string;
  tags?: string[];
  metadata?: Record<string, string>;
  width?: number;
  height?: number;
}

export interface ImageDataResult {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  folder: string;
  createdAt: string;
  eTag: string;
  width?: number;
  height?: number;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface ImageMetadata {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  width: number;
  height: number;
  folder: string;
  createdAt: string;
  modifiedAt: string;
  eTag: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface ProcessingRequest {
  operations: ProcessingOperation[];
  priority: ProcessingPriority;
  outputFormat?: string;
}

export interface ProcessingOperation {
  type: string;
  parameters: Record<string, any>;
}

export enum ProcessingPriority {
  Low = 0,
  Normal = 1,
  High = 2,
  Critical = 3
}

export interface ProcessingResponse {
  processingId: string;
  statusUrl: string;
}

export interface ProcessingStatusResponse {
  processingId: string;
  status: ProcessingStatus;
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  resultUrl?: string;
}

export enum ProcessingStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed'
}

export interface QueueStatisticsResponse {
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
}

export interface ErrorResponse {
  error: string;
}

export interface Base64Response {
  data: string;
}

export interface ImageUrlResponse {
  url: string;
}

// New interfaces for folder management
export interface FolderInfo {
  name: string;
  imageCount: number;
  videoCount?: number;
  totalSize: number;
  lastModified: string;
  description?: string;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
}

export interface FolderListResponse {
  folders: FolderInfo[];
}

// Media type enum for future video support
export enum MediaType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio'
}

// Enhanced media item for future video support
export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
  folder?: string;
  uploadedAt?: string;
  tags?: string[];
  metadata?: Record<string, string>;
  width?: number;
  height?: number;
  duration?: number; // For videos/audio
  bitrate?: number; // For videos/audio
  fps?: number; // For videos
}

// Search and filtering interfaces
export interface SearchFilters {
  query?: string;
  tags?: string[];
  folder?: string;
  mediaType?: MediaType;
  dateRange?: {
    start: string;
    end: string;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'name' | 'date' | 'size' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse {
  items: MediaItem[];
  totalCount: number;
  facets: {
    tags: Array<{ name: string; count: number }>;
    folders: Array<{ name: string; count: number }>;
    types: Array<{ type: MediaType; count: number }>;
  };
}

// Bulk operations
export interface BulkOperation {
  type: 'move' | 'copy' | 'delete' | 'tag' | 'process';
  itemIds: string[];
  parameters?: Record<string, any>;
}

export interface BulkOperationResult {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
}

// Analytics and insights
export interface AnalyticsData {
  totalItems: number;
  totalSize: number;
  itemsByType: Record<MediaType, number>;
  itemsByFolder: Record<string, number>;
  uploadTrends: Array<{
    date: string;
    count: number;
    size: number;
  }>;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
  storageUsage: {
    used: number;
    available: number;
    percentage: number;
  };
}