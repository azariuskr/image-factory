import { createApi } from '@reduxjs/toolkit/query/react';
import { createETagBaseQuery, etagUtils } from './etagBaseQuery';
import {
  GalleryResponse,
  GalleryImage,
  ImageUploadResult,
  BatchUploadResult,
  ImageDataResult,
  ImageMetadata,
  ProcessingRequest,
  ProcessingResponse,
  ProcessingStatusResponse,
  QueueStatisticsResponse,
  Base64Response,
  ImageUrlResponse,
  FolderListResponse,
  CreateFolderRequest,
  FolderInfo,
} from '../../types/api';

const API_BASE_URL = 'http://localhost:8080/api';

// Standard thumbnail sizes for consistent display
const THUMBNAIL_SIZES = {
  small: { w: 200, h: 200 },
  medium: { w: 400, h: 400 },
  large: { w: 800, h: 600 }
} as const;

// Helper functions
const extractImageIdFromUrl = (url: string): string => {
  const match = url.match(/\/images\/([^?]+)/);
  return match ? match[1] : '';
};

const convertUrlsToGalleryImages = (urls: string[], folder: string): GalleryImage[] => {
  return urls.map(url => {
    const id = extractImageIdFromUrl(url);
    // Create optimized thumbnail URL using the dedicated thumbnail endpoint
    const thumbnailUrl = `${API_BASE_URL}/images/${id}/thumbnail?folder=${folder}&w=${THUMBNAIL_SIZES.medium.w}&h=${THUMBNAIL_SIZES.medium.h}`;
    
    return {
      id,
      url: url,
      thumbnailUrl,
      folder: folder,
      fileName: `image-${id}`,
    };
  });
};

// Create API with ETag support
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: createETagBaseQuery(API_BASE_URL),
  tagTypes: ['Image', 'Gallery', 'Processing', 'Queue', 'Folder'],
  endpoints: (builder) => ({
    // Enhanced gallery endpoint with better thumbnail support
    getGallery: builder.query<
      {
        images: GalleryImage[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
        pageSize: number;
        hasMore: boolean;
      },
      {
        folder?: string;
        page?: number;
        pageSize?: number;
        thumbnailSize?: keyof typeof THUMBNAIL_SIZES;
        format?: string;
      }
    >({
      query: ({ 
        folder = 'general', 
        page = 1, 
        pageSize = 20, 
        thumbnailSize = 'medium',
        format = 'webp' 
      }) => {
        const size = THUMBNAIL_SIZES[thumbnailSize];
        return {
          url: '/images/gallery',
          params: { 
            folder, 
            page, 
            pageSize, 
            w: size.w, 
            h: size.h, 
            format 
          },
        };
      },
      transformResponse: (response: GalleryResponse | undefined, meta, arg) => {
        if (!response) {
          return {
            images: [],
            totalCount: 0,
            currentPage: arg.page || 1,
            totalPages: 0,
            pageSize: arg.pageSize || 20,
            hasMore: false,
          };
        }

        const galleryImages = convertUrlsToGalleryImages(
          response.images || [],
          arg.folder || 'general'
        );

        return {
          images: galleryImages,
          totalCount: response.totalItems || 0,
          currentPage: response.page || 1,
          totalPages: response.totalPages || 1,
          pageSize: response.pageSize || 20,
          hasMore: response.hasMore || false,
        };
      },
      providesTags: (result, error, arg) => [
        'Gallery',
        { type: 'Gallery', id: `${arg.folder}-${arg.page}` }
      ],
      keepUnusedDataFor: 300,
    }),

    // Folder management endpoints
    getFolders: builder.query<FolderListResponse, void>({
      query: () => '/folders',
      transformResponse: (response: FolderListResponse | undefined) => {
        if (!response) {
          return { folders: [] };
        }
        return response;
      },
      providesTags: ['Folder'],
      keepUnusedDataFor: 600,
    }),

    createFolder: builder.mutation<FolderInfo, CreateFolderRequest>({
      query: (folderData) => ({
        url: '/folders',
        method: 'POST',
        body: folderData,
      }),
      invalidatesTags: ['Folder'],
    }),

    deleteFolder: builder.mutation<void, string>({
      query: (folderName) => ({
        url: `/folders/${folderName}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Folder', 'Gallery'],
    }),

    // Enhanced upload with tags and metadata support
    uploadImage: builder.mutation<
      ImageUploadResult,
      {
        file: File;
        folder?: string;
        priority?: string;
        tags?: string[];
        metadata?: Record<string, string>;
      }
    >({
      query: ({ file, folder = 'general', priority = 'Normal', tags, metadata }) => {
        const formData = new FormData();
        formData.append('file', file);
        
        if (tags && tags.length > 0) {
          tags.forEach(tag => formData.append('tags', tag));
        }
        
        if (metadata) {
          Object.entries(metadata).forEach(([key, value]) => {
            formData.append(`metadata[${key}]`, value);
          });
        }

        return {
          url: '/images/upload',
          method: 'POST',
          params: { folder, priority },
          body: formData,
        };
      },
      invalidatesTags: ['Gallery', 'Folder'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          etagUtils.manager.clear('/images/gallery');
        } catch {
          // Handle error silently
        }
      },
    }),

    uploadBatch: builder.mutation<
      BatchUploadResult,
      {
        files: File[];
        folder?: string;
        tags?: string[];
        metadata?: Record<string, string>;
      }
    >({
      query: ({ files, folder = 'general', tags, metadata }) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        if (tags && tags.length > 0) {
          tags.forEach(tag => formData.append('tags', tag));
        }
        
        if (metadata) {
          Object.entries(metadata).forEach(([key, value]) => {
            formData.append(`metadata[${key}]`, value);
          });
        }

        return {
          url: '/images/upload/batch',
          method: 'POST',
          params: { folder },
          body: formData,
        };
      },
      invalidatesTags: ['Gallery', 'Folder'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          etagUtils.manager.clear('/images/gallery');
        } catch {
          // Handle error silently
        }
      },
    }),

    // Optimized thumbnail endpoint
    getThumbnail: builder.query<
      Blob,
      {
        id: string;
        folder?: string;
        size?: keyof typeof THUMBNAIL_SIZES;
      }
    >({
      query: ({ id, folder = 'general', size = 'medium' }) => {
        const { w, h } = THUMBNAIL_SIZES[size];
        return {
          url: `/images/${id}/thumbnail`,
          params: { folder, w, h },
          responseHandler: (response) => response.blob(),
        };
      },
      transformResponse: (response: Blob | undefined) => {
        if (!response) {
          return new Blob();
        }
        return response;
      },
      providesTags: (result, error, { id }) => [{ type: 'Image', id: `${id}-thumbnail` }],
      keepUnusedDataFor: 1800, // 30 minutes for thumbnails
    }),

    // Image data endpoints
    getImageData: builder.query<
      ImageDataResult,
      {
        id: string;
        folder?: string;
      }
    >({
      query: ({ id, folder = 'general' }) => ({
        url: `/images/${id}/data`,
        params: { folder },
      }),
      transformResponse: (response: ImageDataResult | undefined) => {
        if (!response) {
          return {} as ImageDataResult;
        }
        return response;
      },
      providesTags: (result, error, { id }) => [{ type: 'Image', id }],
      keepUnusedDataFor: 600,
    }),

    getImageMetadata: builder.query<
      ImageMetadata,
      {
        id: string;
        folder?: string;
      }
    >({
      query: ({ id, folder = 'general' }) => ({
        url: `/images/${id}/metadata`,
        params: { folder },
      }),
      transformResponse: (response: ImageMetadata | undefined) => {
        if (!response) {
          return {} as ImageMetadata;
        }
        return response;
      },
      providesTags: (result, error, { id }) => [{ type: 'Image', id }],
      keepUnusedDataFor: 600,
    }),

    getImageAsBase64: builder.query<
      Base64Response,
      {
        id: string;
        folder?: string;
        w?: number;
        h?: number;
      }
    >({
      query: ({ id, folder = 'general', w, h }) => ({
        url: `/images/${id}/base64`,
        params: { folder, w, h },
      }),
      transformResponse: (response: Base64Response | undefined) => {
        if (!response) {
          return { data: '' } as Base64Response;
        }
        return response;
      },
      providesTags: (result, error, { id }) => [{ type: 'Image', id }],
      keepUnusedDataFor: 300,
    }),

    getImageUrl: builder.query<
      ImageUrlResponse,
      {
        id: string;
        folder?: string;
        w?: number;
        h?: number;
        format?: string;
      }
    >({
      query: ({ id, folder = 'general', w, h, format }) => ({
        url: `/images/${id}/url`,
        params: { folder, w, h, format },
      }),
      transformResponse: (response: ImageUrlResponse | undefined) => {
        if (!response) {
          return { url: '' } as ImageUrlResponse;
        }
        return response;
      },
      providesTags: (result, error, { id }) => [{ type: 'Image', id }],
      keepUnusedDataFor: 600,
    }),

    // Delete endpoint
    deleteImage: builder.mutation<
      void,
      {
        id: string;
        folder?: string;
      }
    >({
      query: ({ id, folder = 'general' }) => ({
        url: `/images/${id}`,
        method: 'DELETE',
        params: { folder },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Gallery',
        'Folder',
        { type: 'Image', id }
      ],
      async onQueryStarted({ id, folder = 'general' }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          etagUtils.manager.clear(`/images/${id}`);
          etagUtils.manager.clear(`"folder":"${folder}"`);
        } catch {
          // Handle error silently
        }
      },
    }),

    // Processing endpoints
    processImage: builder.mutation<
      ProcessingResponse,
      {
        id: string;
        request: ProcessingRequest;
        folder?: string;
      }
    >({
      query: ({ id, request, folder = 'general' }) => ({
        url: `/images/${id}/process`,
        method: 'POST',
        params: { folder },
        body: request,
      }),
      invalidatesTags: (result, error, arg) => [
        'Processing',
        { type: 'Image', id: arg.id }
      ],
      async onQueryStarted({ id }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          etagUtils.manager.clear(`/images/${id}`);
        } catch {
          // Handle error silently
        }
      },
    }),

    getProcessingStatus: builder.query<ProcessingStatusResponse, string>({
      query: (processingId) => `/images/processing/${processingId}`,
      transformResponse: (response: ProcessingStatusResponse | undefined) => {
        if (!response) {
          return { status: 'Unknown' } as ProcessingStatusResponse;
        }
        return response;
      },
      providesTags: (result, error, processingId) => [
        { type: 'Processing', id: processingId }
      ],
      keepUnusedDataFor: 60,
    }),

    // Queue statistics
    getQueueStatistics: builder.query<QueueStatisticsResponse, void>({
      query: () => '/images/queue/stats',
      transformResponse: (response: QueueStatisticsResponse | undefined) => {
        if (!response) {
          return {} as QueueStatisticsResponse;
        }
        return response;
      },
      providesTags: ['Queue'],
      keepUnusedDataFor: 30,
    }),
  }),
});

// Export hooks
export const {
  useGetGalleryQuery,
  useGetFoldersQuery,
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useUploadImageMutation,
  useUploadBatchMutation,
  useGetThumbnailQuery,
  useGetImageDataQuery,
  useGetImageMetadataQuery,
  useGetImageAsBase64Query,
  useGetImageUrlQuery,
  useDeleteImageMutation,
  useProcessImageMutation,
  useGetProcessingStatusQuery,
  useGetQueueStatisticsQuery,
} = apiSlice;

// Export utilities for manual cache management
export const imageApiUtils = {
  clearAllETags: () => etagUtils.manager.clear(),
  clearETagsByPattern: (pattern: string) => etagUtils.manager.clear(pattern),
  getETag: (url: string, params?: Record<string, any>) => {
    const key = etagUtils.generateKey(url, params);
    return etagUtils.manager.get(key);
  },
  setETag: (url: string, params: Record<string, any>, etag: string) => {
    const key = etagUtils.generateKey(url, params);
    etagUtils.manager.set(key, etag);
  },
  debugETags: () => etagUtils.debugETags(),
  thumbnailSizes: THUMBNAIL_SIZES,
};