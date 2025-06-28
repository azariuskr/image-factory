import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
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

// Mock data storage
let mockFolders: FolderInfo[] = [
  {
    name: 'general',
    description: 'Default folder',
    imageCount: 0,
    totalSize: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let mockImages: Record<string, GalleryImage[]> = {
  general: []
};

// Helper to generate mock image URLs from Pexels
const generateMockImages = (count: number, folder: string): GalleryImage[] => {
  const images: GalleryImage[] = [];
  for (let i = 1; i <= count; i++) {
    const id = `${folder}-${Date.now()}-${i}`;
    const imageUrl = `https://images.pexels.com/photos/${1000000 + i}/pexels-photo-${1000000 + i}.jpeg?auto=compress&cs=tinysrgb&w=800&h=600`;
    const thumbnailUrl = `https://images.pexels.com/photos/${1000000 + i}/pexels-photo-${1000000 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=400`;
    
    images.push({
      id,
      url: imageUrl,
      thumbnailUrl,
      folder,
      fileName: `image-${i}.jpg`,
    });
  }
  return images;
};

// Initialize with some sample images
mockImages.general = generateMockImages(5, 'general');
mockFolders[0].imageCount = mockImages.general.length;
mockFolders[0].totalSize = mockImages.general.length * 1024 * 1024; // 1MB per image

// Standard thumbnail sizes for consistent display
const THUMBNAIL_SIZES = {
  small: { w: 200, h: 200 },
  medium: { w: 400, h: 400 },
  large: { w: 800, h: 600 }
} as const;

// Create API with mock implementation
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Image', 'Gallery', 'Processing', 'Queue', 'Folder'],
  endpoints: (builder) => ({
    // Gallery endpoint
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
      queryFn: async ({ 
        folder = 'general', 
        page = 1, 
        pageSize = 20, 
        thumbnailSize = 'medium',
        format = 'webp' 
      }) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const folderImages = mockImages[folder] || [];
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedImages = folderImages.slice(startIndex, endIndex);

        const totalPages = Math.ceil(folderImages.length / pageSize);
        const hasMore = page < totalPages;

        return {
          data: {
            images: paginatedImages,
            totalCount: folderImages.length,
            currentPage: page,
            totalPages,
            pageSize,
            hasMore,
          }
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
      queryFn: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return {
          data: { folders: mockFolders }
        };
      },
      providesTags: ['Folder'],
      keepUnusedDataFor: 600,
    }),

    createFolder: builder.mutation<FolderInfo, CreateFolderRequest>({
      queryFn: async (folderData) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if folder already exists
        if (mockFolders.some(f => f.name === folderData.name)) {
          return {
            error: {
              status: 400,
              data: { message: 'Folder already exists' }
            }
          };
        }

        const newFolder: FolderInfo = {
          name: folderData.name,
          description: folderData.description || '',
          imageCount: 0,
          totalSize: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        mockFolders.push(newFolder);
        mockImages[folderData.name] = [];

        return { data: newFolder };
      },
      invalidatesTags: ['Folder'],
    }),

    deleteFolder: builder.mutation<void, string>({
      queryFn: async (folderName) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Don't allow deleting the general folder
        if (folderName === 'general') {
          return {
            error: {
              status: 400,
              data: { message: 'Cannot delete the general folder' }
            }
          };
        }

        // Remove folder from mock data
        mockFolders = mockFolders.filter(f => f.name !== folderName);
        delete mockImages[folderName];

        return { data: undefined };
      },
      invalidatesTags: ['Folder', 'Gallery'],
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
      queryFn: async ({ file, folder = 'general', priority = 'Normal', tags, metadata }) => {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const id = `${folder}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create a mock image URL (using a placeholder service)
        const imageUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000) + 1000000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800&h=600`;
        const thumbnailUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000) + 1000000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400&h=400`;

        const newImage: GalleryImage = {
          id,
          url: imageUrl,
          thumbnailUrl,
          folder,
          fileName: file.name,
        };

        // Add to mock storage
        if (!mockImages[folder]) {
          mockImages[folder] = [];
        }
        mockImages[folder].unshift(newImage);

        // Update folder stats
        const folderInfo = mockFolders.find(f => f.name === folder);
        if (folderInfo) {
          folderInfo.imageCount++;
          folderInfo.totalSize += file.size;
          folderInfo.updatedAt = new Date().toISOString();
        }

        return {
          data: {
            id,
            url: imageUrl,
            thumbnailUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            folder,
            uploadedAt: new Date().toISOString()
          }
        };
      },
      invalidatesTags: ['Gallery', 'Folder'],
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
      queryFn: async ({ files, folder = 'general', tags, metadata }) => {
        // Simulate batch upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const results: ImageUploadResult[] = [];
        let totalSize = 0;

        for (const file of files) {
          const id = `${folder}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const imageUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000) + 1000000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800&h=600`;
          const thumbnailUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000) + 1000000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400&h=400`;

          const newImage: GalleryImage = {
            id,
            url: imageUrl,
            thumbnailUrl,
            folder,
            fileName: file.name,
          };

          if (!mockImages[folder]) {
            mockImages[folder] = [];
          }
          mockImages[folder].unshift(newImage);

          results.push({
            id,
            url: imageUrl,
            thumbnailUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            folder,
            uploadedAt: new Date().toISOString()
          });

          totalSize += file.size;
        }

        // Update folder stats
        const folderInfo = mockFolders.find(f => f.name === folder);
        if (folderInfo) {
          folderInfo.imageCount += files.length;
          folderInfo.totalSize += totalSize;
          folderInfo.updatedAt = new Date().toISOString();
        }

        return {
          data: {
            results,
            totalUploaded: files.length,
            totalSize,
            folder
          }
        };
      },
      invalidatesTags: ['Gallery', 'Folder'],
    }),

    // Image data endpoints (mock implementations)
    getThumbnail: builder.query<
      Blob,
      {
        id: string;
        folder?: string;
        size?: keyof typeof THUMBNAIL_SIZES;
      }
    >({
      queryFn: async ({ id, folder = 'general', size = 'medium' }) => {
        // Return empty blob for mock
        return { data: new Blob() };
      },
      providesTags: (result, error, { id }) => [{ type: 'Image', id: `${id}-thumbnail` }],
      keepUnusedDataFor: 1800,
    }),

    getImageData: builder.query<
      ImageDataResult,
      {
        id: string;
        folder?: string;
      }
    >({
      queryFn: async ({ id, folder = 'general' }) => {
        return {
          data: {
            id,
            fileName: `image-${id}.jpg`,
            fileSize: 1024 * 1024,
            mimeType: 'image/jpeg',
            folder,
            uploadedAt: new Date().toISOString()
          }
        };
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
      queryFn: async ({ id, folder = 'general' }) => {
        return {
          data: {
            width: 800,
            height: 600,
            format: 'JPEG',
            colorSpace: 'sRGB',
            hasAlpha: false,
            dpi: 72
          }
        };
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
      queryFn: async ({ id, folder = 'general', w, h }) => {
        return {
          data: { data: '' }
        };
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
      queryFn: async ({ id, folder = 'general', w, h, format }) => {
        const folderImages = mockImages[folder] || [];
        const image = folderImages.find(img => img.id === id);
        return {
          data: { url: image?.url || '' }
        };
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
      queryFn: async ({ id, folder = 'general' }) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        if (mockImages[folder]) {
          const imageIndex = mockImages[folder].findIndex(img => img.id === id);
          if (imageIndex !== -1) {
            mockImages[folder].splice(imageIndex, 1);
            
            // Update folder stats
            const folderInfo = mockFolders.find(f => f.name === folder);
            if (folderInfo) {
              folderInfo.imageCount--;
              folderInfo.totalSize = Math.max(0, folderInfo.totalSize - (1024 * 1024));
              folderInfo.updatedAt = new Date().toISOString();
            }
          }
        }

        return { data: undefined };
      },
      invalidatesTags: (result, error, { id }) => [
        'Gallery',
        'Folder',
        { type: 'Image', id }
      ],
    }),

    // Processing endpoints (mock implementations)
    processImage: builder.mutation<
      ProcessingResponse,
      {
        id: string;
        request: ProcessingRequest;
        folder?: string;
      }
    >({
      queryFn: async ({ id, request, folder = 'general' }) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          data: {
            processingId: `proc-${Date.now()}`,
            status: 'Completed',
            resultUrl: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000) + 1000000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800&h=600`
          }
        };
      },
      invalidatesTags: (result, error, arg) => [
        'Processing',
        { type: 'Image', id: arg.id }
      ],
    }),

    getProcessingStatus: builder.query<ProcessingStatusResponse, string>({
      queryFn: async (processingId) => {
        return {
          data: { status: 'Completed' }
        };
      },
      providesTags: (result, error, processingId) => [
        { type: 'Processing', id: processingId }
      ],
      keepUnusedDataFor: 60,
    }),

    // Queue statistics
    getQueueStatistics: builder.query<QueueStatisticsResponse, void>({
      queryFn: async () => {
        return {
          data: {
            pending: 0,
            processing: 0,
            completed: 10,
            failed: 0
          }
        };
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

// Export utilities for compatibility
export const imageApiUtils = {
  clearAllETags: () => {},
  clearETagsByPattern: (pattern: string) => {},
  getETag: (url: string, params?: Record<string, any>) => null,
  setETag: (url: string, params: Record<string, any>, etag: string) => {},
  debugETags: () => {},
  thumbnailSizes: THUMBNAIL_SIZES,
};