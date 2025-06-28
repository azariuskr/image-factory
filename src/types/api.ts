export interface ImageUploadResult {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  folder: string;
  uploadedAt: string;
  eTag: string;
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

// For internal use in components - we'll extract ID from URL
export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
  folder?: string;
  uploadedAt?: string;
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
