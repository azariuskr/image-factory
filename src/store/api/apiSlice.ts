// // import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// // import {
// //   GalleryResponse,
// //   GalleryImage,
// //   ImageUploadResult,
// //   BatchUploadResult,
// //   ImageDataResult,
// //   ImageMetadata,
// //   ProcessingRequest,
// //   ProcessingResponse,
// //   ProcessingStatusResponse,
// //   QueueStatisticsResponse,
// //   Base64Response,
// //   ImageUrlResponse,
// //   ErrorResponse
// // } from '../../types/api';

// // // Base API URL - you'll need to configure this for your .NET API
// // const API_BASE_URL = 'http://localhost:8080/api'; // Updated to match your API

// // // Helper function to extract image ID from URL
// // const extractImageIdFromUrl = (url: string): string => {
// //   const match = url.match(/\/images\/([^?]+)/);
// //   return match ? match[1] : '';
// // };

// // // Helper function to convert URL array to GalleryImage objects
// // const convertUrlsToGalleryImages = (urls: string[], folder: string): GalleryImage[] => {
// //   return urls.map(url => ({
// //     id: extractImageIdFromUrl(url),
// //     url: url,
// //     thumbnailUrl: url, // Same URL for now, could be modified for different sizes
// //     folder: folder,
// //     fileName: `image-${extractImageIdFromUrl(url)}`, // Placeholder filename
// //   }));
// // };

// // export const apiSlice = createApi({
// //   reducerPath: 'api',
// //   baseQuery: fetchBaseQuery({
// //     baseUrl: API_BASE_URL,
// //   }),
// //   tagTypes: ['Image', 'Gallery', 'Processing', 'Queue'],
// //   endpoints: (builder) => ({
// //     // Gallery endpoints
// //     getGallery: builder.query<{
// //       images: GalleryImage[];
// //       totalCount: number;
// //       currentPage: number;
// //       totalPages: number;
// //       pageSize: number;
// //       hasMore: boolean;
// //     }, {
// //       folder?: string;
// //       page?: number;
// //       pageSize?: number;
// //       w?: number;
// //       h?: number;
// //       format?: string;
// //     }>({
// //       query: ({ folder = 'general', page = 1, pageSize = 20, w, h, format }) => ({
// //         url: '/images/gallery',
// //         params: { folder, page, pageSize, w, h, format },
// //       }),
// //       transformResponse: (response: GalleryResponse, meta, arg) => {
// //         const galleryImages = convertUrlsToGalleryImages(response.images, arg.folder || 'general');
// //         return {
// //           images: galleryImages,
// //           totalCount: response.totalItems,
// //           currentPage: response.page,
// //           totalPages: response.totalPages,
// //           pageSize: response.pageSize,
// //           hasMore: response.hasMore,
// //         };
// //       },
// //       providesTags: ['Gallery'],
// //     }),

// //     // Upload endpoints
// //     uploadImage: builder.mutation<ImageUploadResult, {
// //       file: File;
// //       folder?: string;
// //       priority?: string;
// //     }>({
// //       query: ({ file, folder = 'general', priority = 'Normal' }) => {
// //         const formData = new FormData();
// //         formData.append('file', file);
// //         return {
// //           url: '/images/upload',
// //           method: 'POST',
// //           params: { folder, priority },
// //           body: formData,
// //         };
// //       },
// //       invalidatesTags: ['Gallery'],
// //     }),

// //     uploadBatch: builder.mutation<BatchUploadResult, {
// //       files: File[];
// //       folder?: string;
// //     }>({
// //       query: ({ files, folder = 'general' }) => {
// //         const formData = new FormData();
// //         files.forEach(file => formData.append('files', file));
// //         return {
// //           url: '/images/upload/batch',
// //           method: 'POST',
// //           params: { folder },
// //           body: formData,
// //         };
// //       },
// //       invalidatesTags: ['Gallery'],
// //     }),

// //     // Image data endpoints
// //     getImageData: builder.query<ImageDataResult, {
// //       id: string;
// //       folder?: string;
// //     }>({
// //       query: ({ id, folder = 'general' }) => ({
// //         url: `/images/${id}/data`,
// //         params: { folder },
// //       }),
// //       providesTags: (result, error, { id }) => [{ type: 'Image', id }],
// //     }),

// //     getImageMetadata: builder.query<ImageMetadata, {
// //       id: string;
// //       folder?: string;
// //     }>({
// //       query: ({ id, folder = 'general' }) => ({
// //         url: `/images/${id}/metadata`,
// //         params: { folder },
// //       }),
// //       providesTags: (result, error, { id }) => [{ type: 'Image', id }],
// //     }),

// //     getImageAsBase64: builder.query<Base64Response, {
// //       id: string;
// //       folder?: string;
// //       w?: number;
// //       h?: number;
// //     }>({
// //       query: ({ id, folder = 'general', w, h }) => ({
// //         url: `/images/${id}/base64`,
// //         params: { folder, w, h },
// //       }),
// //       providesTags: (result, error, { id }) => [{ type: 'Image', id }],
// //     }),

// //     getImageUrl: builder.query<ImageUrlResponse, {
// //       id: string;
// //       folder?: string;
// //       w?: number;
// //       h?: number;
// //       format?: string;
// //     }>({
// //       query: ({ id, folder = 'general', w, h, format }) => ({
// //         url: `/images/${id}/url`,
// //         params: { folder, w, h, format },
// //       }),
// //       providesTags: (result, error, { id }) => [{ type: 'Image', id }],
// //     }),

// //     // Delete endpoint
// //     deleteImage: builder.mutation<void, {
// //       id: string;
// //       folder?: string;
// //     }>({
// //       query: ({ id, folder = 'general' }) => ({
// //         url: `/images/${id}`,
// //         method: 'DELETE',
// //         params: { folder },
// //       }),
// //       invalidatesTags: ['Gallery'],
// //     }),

// //     // Processing endpoints
// //     processImage: builder.mutation<ProcessingResponse, {
// //       id: string;
// //       request: ProcessingRequest;
// //       folder?: string;
// //     }>({
// //       query: ({ id, request, folder = 'general' }) => ({
// //         url: `/images/${id}/process`,
// //         method: 'POST',
// //         params: { folder },
// //         body: request,
// //       }),
// //       invalidatesTags: ['Processing'],
// //     }),

// //     getProcessingStatus: builder.query<ProcessingStatusResponse, string>({
// //       query: (processingId) => `/images/processing/${processingId}`,
// //       providesTags: (result, error, processingId) => [{ type: 'Processing', id: processingId }],
// //     }),

// //     // Queue statistics
// //     getQueueStatistics: builder.query<QueueStatisticsResponse, void>({
// //       query: () => '/images/queue/stats',
// //       providesTags: ['Queue'],
// //     }),
// //   }),
// // });

// // export const {
// //   useGetGalleryQuery,
// //   useUploadImageMutation,
// //   useUploadBatchMutation,
// //   useGetImageDataQuery,
// //   useGetImageMetadataQuery,
// //   useGetImageAsBase64Query,
// //   useGetImageUrlQuery,
// //   useDeleteImageMutation,
// //   useProcessImageMutation,
// //   useGetProcessingStatusQuery,
// //   useGetQueueStatisticsQuery,
// // } = apiSlice;
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import {
//   GalleryResponse,
//   GalleryImage,
//   ImageUploadResult,
//   BatchUploadResult,
//   ImageDataResult,
//   ImageMetadata,
//   ProcessingRequest,
//   ProcessingResponse,
//   ProcessingStatusResponse,
//   QueueStatisticsResponse,
//   Base64Response,
//   ImageUrlResponse,
//   ErrorResponse
// } from '../../types/api';

// // Base API URL - you'll need to configure this for your .NET API
// const API_BASE_URL = 'http://localhost:8080/api';

// // ETag cache to store ETags for different endpoints
// const etagCache = new Map<string, string>();

// // Helper function to generate cache key for ETag storage
// const generateETagCacheKey = (endpoint: string, params: Record<string, any> = {}): string => {
//   const sortedParams = Object.keys(params)
//     .sort()
//     .reduce((result, key) => {
//       result[key] = params[key];
//       return result;
//     }, {} as Record<string, any>);

//   return `${endpoint}:${JSON.stringify(sortedParams)}`;
// };

// // Helper function to extract image ID from URL
// const extractImageIdFromUrl = (url: string): string => {
//   const match = url.match(/\/images\/([^?]+)/);
//   return match ? match[1] : '';
// };

// // Helper function to convert URL array to GalleryImage objects
// const convertUrlsToGalleryImages = (urls: string[], folder: string): GalleryImage[] => {
//   return urls.map(url => ({
//     id: extractImageIdFromUrl(url),
//     url: url,
//     thumbnailUrl: url,
//     folder: folder,
//     fileName: `image-${extractImageIdFromUrl(url)}`,
//   }));
// };

// // Enhanced base query with ETag support
// const baseQueryWithETag = fetchBaseQuery({
//   baseUrl: API_BASE_URL,
//   prepareHeaders: (headers, { endpoint, arg }) => {
//     // Generate cache key for this request
//     const cacheKey = generateETagCacheKey(endpoint, arg);

//     // Add If-None-Match header if we have a stored ETag
//     const storedETag = etagCache.get(cacheKey);
//     if (storedETag) {
//       headers.set('If-None-Match', storedETag);
//     }

//     return headers;
//   },
// });

// // Custom base query that handles ETag responses
// const baseQueryWithETagHandling = async (args: any, api: any, extraOptions: any) => {
//   const result = await baseQueryWithETag(args, api, extraOptions);

//   // Handle ETag from response
//   if (result.meta?.response?.headers) {
//     const etag = result.meta.response.headers.get('ETag');
//     if (etag) {
//       // Generate cache key for storing ETag
//       const cacheKey = generateETagCacheKey(api.endpoint, args.params || {});
//       etagCache.set(cacheKey, etag);
//     }
//   }

//   // Handle 304 Not Modified responses
//   if (result.meta?.response?.status === 304) {
//     // Return cached data if available
//     // RTK Query will handle this automatically with its cache
//     return { data: undefined }; // RTK Query will use cached data
//   }

//   return result;
// };

// export const apiSlice = createApi({
//   reducerPath: 'api',
//   baseQuery: baseQueryWithETagHandling,
//   tagTypes: ['Image', 'Gallery', 'Processing', 'Queue'],
//   endpoints: (builder) => ({
//     // Gallery endpoints with ETag support
//     getGallery: builder.query<{
//       images: GalleryImage[];
//       totalCount: number;
//       currentPage: number;
//       totalPages: number;
//       pageSize: number;
//       hasMore: boolean;
//     }, {
//       folder?: string;
//       page?: number;
//       pageSize?: number;
//       w?: number;
//       h?: number;
//       format?: string;
//     }>({
//       query: ({ folder = 'general', page = 1, pageSize = 20, w, h, format }) => ({
//         url: '/images/gallery',
//         params: { folder, page, pageSize, w, h, format },
//       }),
//       transformResponse: (response: GalleryResponse, meta, arg) => {
//         const galleryImages = convertUrlsToGalleryImages(response.images, arg.folder || 'general');
//         return {
//           images: galleryImages,
//           totalCount: response.totalItems,
//           currentPage: response.page,
//           totalPages: response.totalPages,
//           pageSize: response.pageSize,
//           hasMore: response.hasMore,
//         };
//       },
//       providesTags: ['Gallery'],
//       // Keep cached data for 5 minutes (300 seconds)
//       keepUnusedDataFor: 300,
//     }),

//     // Upload endpoints (ETags not typically needed for mutations)
//     uploadImage: builder.mutation<ImageUploadResult, {
//       file: File;
//       folder?: string;
//       priority?: string;
//     }>({
//       query: ({ file, folder = 'general', priority = 'Normal' }) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         return {
//           url: '/images/upload',
//           method: 'POST',
//           params: { folder, priority },
//           body: formData,
//         };
//       },
//       invalidatesTags: ['Gallery'],
//     }),

//     uploadBatch: builder.mutation<BatchUploadResult, {
//       files: File[];
//       folder?: string;
//     }>({
//       query: ({ files, folder = 'general' }) => {
//         const formData = new FormData();
//         files.forEach(file => formData.append('files', file));
//         return {
//           url: '/images/upload/batch',
//           method: 'POST',
//           params: { folder },
//           body: formData,
//         };
//       },
//       invalidatesTags: ['Gallery'],
//     }),

//     // Image data endpoints with ETag support
//     getImageData: builder.query<ImageDataResult, {
//       id: string;
//       folder?: string;
//     }>({
//       query: ({ id, folder = 'general' }) => ({
//         url: `/images/${id}/data`,
//         params: { folder },
//       }),
//       providesTags: (result, error, { id }) => [{ type: 'Image', id }],
//       keepUnusedDataFor: 600, // 10 minutes for individual images
//     }),

//     getImageMetadata: builder.query<ImageMetadata, {
//       id: string;
//       folder?: string;
//     }>({
//       query: ({ id, folder = 'general' }) => ({
//         url: `/images/${id}/metadata`,
//         params: { folder },
//       }),
//       providesTags: (result, error, { id }) => [{ type: 'Image', id }],
//       keepUnusedDataFor: 600,
//     }),

//     getImageAsBase64: builder.query<Base64Response, {
//       id: string;
//       folder?: string;
//       w?: number;
//       h?: number;
//     }>({
//       query: ({ id, folder = 'general', w, h }) => ({
//         url: `/images/${id}/base64`,
//         params: { folder, w, h },
//       }),
//       providesTags: (result, error, { id }) => [{ type: 'Image', id }],
//       keepUnusedDataFor: 300, // Base64 data is large, cache for less time
//     }),

//     getImageUrl: builder.query<ImageUrlResponse, {
//       id: string;
//       folder?: string;
//       w?: number;
//       h?: number;
//       format?: string;
//     }>({
//       query: ({ id, folder = 'general', w, h, format }) => ({
//         url: `/images/${id}/url`,
//         params: { folder, w, h, format },
//       }),
//       providesTags: (result, error, { id }) => [{ type: 'Image', id }],
//       keepUnusedDataFor: 600,
//     }),

//     // Delete endpoint
//     deleteImage: builder.mutation<void, {
//       id: string;
//       folder?: string;
//     }>({
//       query: ({ id, folder = 'general' }) => ({
//         url: `/images/${id}`,
//         method: 'DELETE',
//         params: { folder },
//       }),
//       invalidatesTags: ['Gallery'],
//       // Clear ETag cache for deleted image
//       async onQueryStarted({ id, folder = 'general' }, { dispatch, queryFulfilled }) {
//         try {
//           await queryFulfilled;
//           // Clear related ETag cache entries
//           const keysToRemove = Array.from(etagCache.keys()).filter(key =>
//             key.includes(`/images/${id}`) || key.includes(`folder":"${folder}"`)
//           );
//           keysToRemove.forEach(key => etagCache.delete(key));
//         } catch (error) {
//           // Handle error if needed
//         }
//       },
//     }),

//     // Processing endpoints
//     processImage: builder.mutation<ProcessingResponse, {
//       id: string;
//       request: ProcessingRequest;
//       folder?: string;
//     }>({
//       query: ({ id, request, folder = 'general' }) => ({
//         url: `/images/${id}/process`,
//         method: 'POST',
//         params: { folder },
//         body: request,
//       }),
//       invalidatesTags: ['Processing'],
//     }),

//     getProcessingStatus: builder.query<ProcessingStatusResponse, string>({
//       query: (processingId) => `/images/processing/${processingId}`,
//       providesTags: (result, error, processingId) => [{ type: 'Processing', id: processingId }],
//       keepUnusedDataFor: 60, // Processing status changes frequently
//     }),

//     // Queue statistics
//     getQueueStatistics: builder.query<QueueStatisticsResponse, void>({
//       query: () => '/images/queue/stats',
//       providesTags: ['Queue'],
//       keepUnusedDataFor: 30, // Queue stats change frequently
//     }),
//   }),
// });

// // Export a function to manually clear ETag cache if needed
// export const clearETagCache = (pattern?: string) => {
//   if (pattern) {
//     const keysToRemove = Array.from(etagCache.keys()).filter(key => key.includes(pattern));
//     keysToRemove.forEach(key => etagCache.delete(key));
//   } else {
//     etagCache.clear();
//   }
// };

// // Export a function to get current ETag cache status (for debugging)
// export const getETagCacheStatus = () => {
//   return {
//     size: etagCache.size,
//     keys: Array.from(etagCache.keys()),
//   };
// };

// export const {
//   useGetGalleryQuery,
//   useUploadImageMutation,
//   useUploadBatchMutation,
//   useGetImageDataQuery,
//   useGetImageMetadataQuery,
//   useGetImageAsBase64Query,
//   useGetImageUrlQuery,
//   useDeleteImageMutation,
//   useProcessImageMutation,
//   useGetProcessingStatusQuery,
//   useGetQueueStatisticsQuery,
// } = apiSlice;
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
} from '../../types/api';

const API_BASE_URL = 'http://localhost:8080/api';

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

// Create API with ETag support using standard RTK Query
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: createETagBaseQuery(API_BASE_URL),
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
        // Handle 304 Not Modified - RTK Query will use cached data
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
      keepUnusedDataFor: 300, // 5 minutes
    }),

    // Upload endpoints
    uploadImage: builder.mutation<
      ImageUploadResult,
      {
        file: File;
        folder?: string;
        priority?: string;
      }
    >({
      query: ({ file, folder = 'general', priority = 'Normal' }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/images/upload',
          method: 'POST',
          params: { folder, priority },
          body: formData,
        };
      },
      invalidatesTags: ['Gallery'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear gallery ETags when new images are uploaded
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
      }
    >({
      query: ({ files, folder = 'general' }) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return {
          url: '/images/upload/batch',
          method: 'POST',
          params: { folder },
          body: formData,
        };
      },
      invalidatesTags: ['Gallery'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          etagUtils.manager.clear('/images/gallery');
        } catch {
          // Handle error silently
        }
      },
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
        // Handle 304 response
        if (!response) {
          return {} as ImageDataResult;
        }
        return response;
      },
      providesTags: (result, error, { id }) => [{ type: 'Image', id }],
      keepUnusedDataFor: 600, // 10 minutes
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
      async onQueryStarted({ id, folder = 'general' }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear ETags for this specific image
          etagUtils.manager.clear(`/images/${id}`);
          // Clear gallery ETags for this folder
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
          // Clear ETags for processed image
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

// Export utilities for manual cache management
export const imageApiUtils = {
  // Clear all ETags
  clearAllETags: () => etagUtils.manager.clear(),

  // Clear ETags for a specific pattern
  clearETagsByPattern: (pattern: string) => etagUtils.manager.clear(pattern),

  // Get ETag for a specific endpoint
  getETag: (url: string, params?: Record<string, any>) => {
    const key = etagUtils.generateKey(url, params);
    return etagUtils.manager.get(key);
  },

  // Manually set an ETag (useful for testing)
  setETag: (url: string, params: Record<string, any>, etag: string) => {
    const key = etagUtils.generateKey(url, params);
    etagUtils.manager.set(key, etag);
  },

  // Debug current ETags
  debugETags: () => etagUtils.debugETags(),
};
