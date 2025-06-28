import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
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
} from '../../types/api';

const API_BASE_URL = 'https://myapi123.loca.lt/api';

// Helper functions
const extractImageIdFromUrl = (url: string): string => {
  const match = url.match(/\/images\/([^?]+)/);
  return match ? match[1] : '';
};

const convertUrlsToGalleryImages = (urls: string[], folder: string): GalleryImage[] => {
  return urls.map(url => ({
    id: extractImageIdFromUrl(url),
    url: url,
    thumbnailUrl: url,
    folder: folder,
    fileName: `image-${extractImageIdFromUrl(url)}`,
  }));
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ['Image', 'Gallery', 'Processing', 'Queue'],
  endpoints: (builder) => ({
    // Gallery endpoints
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
        w?: number;
        h?: number;
        format?: string;
      }
    >({
      query: ({ folder = 'general', page = 1, pageSize = 20, w, h, format }) => ({
        url: '/images/gallery',
        params: { folder, page, pageSize, w, h, format },
      }),
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

    // Upload endpoints
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
        
        // Add tags and metadata if provided
        if (tags) {
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
      invalidatesTags: ['Gallery'],
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
        
        // Add tags and metadata if provided
        if (tags) {
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
      invalidatesTags: ['Gallery'],
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
          return { base64: '' } as Base64Response;
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
        { type: 'Image', id }
      ],
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
  useUploadImageMutation,
  useUploadBatchMutation,
  useGetImageDataQuery,
  useGetImageMetadataQuery,
  useGetImageAsBase64Query,
  useGetImageUrlQuery,
  useDeleteImageMutation,
  useProcessImageMutation,
  useGetProcessingStatusQuery,
  useGetQueueStatisticsQuery,
} = apiSlice;