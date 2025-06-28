import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  LayoutGrid, 
  CheckSquare, 
  Folder, 
  GitCompare as Compare, 
  Maximize2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useGetGalleryQuery, useDeleteImageMutation } from '../store/api/apiSlice';
import { GalleryImage, SearchFilters, BulkOperation } from '../types/api';
import ImageGrid from '../components/gallery/ImageGrid';
import ImageModal from '../components/gallery/ImageModal';
import ImagePreview from '../components/gallery/ImagePreview';
import ImageComparison from '../components/gallery/ImageComparison';
import Pagination from '../components/gallery/Pagination';
import BulkOperations from '../components/bulk/BulkOperations';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const Gallery: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [folder, setFolder] = useState('general');
  const [pageSize, setPageSize] = useState(20);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [thumbnailSize, setThumbnailSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonImages, setComparisonImages] = useState<GalleryImage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Advanced search filters
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    folder: 'general',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Get thumbnail dimensions based on size
  const getThumbnailDimensions = (size: string) => {
    switch (size) {
      case 'small': return { w: 200, h: 200 };
      case 'large': return { w: 600, h: 400 };
      default: return { w: 400, h: 400 }; // medium
    }
  };

  const thumbnailDims = getThumbnailDimensions(thumbnailSize);

  const { data: galleryData, isLoading, error, refetch } = useGetGalleryQuery({
    folder: searchFilters.folder || folder,
    page: currentPage,
    pageSize,
    w: thumbnailDims.w,
    h: thumbnailDims.h,
    format: 'webp'
  });

  const [deleteImage] = useDeleteImageMutation();

  const handleDeleteImage = useCallback(async (id: string, imageFolder: string) => {
    try {
      await deleteImage({ id, folder: imageFolder }).unwrap();
      refetch();
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }, [deleteImage, refetch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFolderChange = useCallback((newFolder: string) => {
    setFolder(newFolder);
    setSearchFilters(prev => ({ ...prev, folder: newFolder }));
    setCurrentPage(1);
    setSelectedIds([]);
  }, []);

  const handleSearch = useCallback(() => {
    setFolder(searchFilters.folder || 'general');
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchFilters.folder]);

  const handleClearFilters = useCallback(() => {
    setSearchFilters({
      query: '',
      folder: 'general',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setFolder('general');
    setCurrentPage(1);
    setSelectedIds([]);
  }, []);

  const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
    console.log('Bulk operation:', operation);
    
    if (operation.type === 'delete') {
      for (const id of operation.itemIds) {
        await handleDeleteImage(id, folder);
      }
    }
    
    setSelectedIds([]);
    refetch();
  }, [handleDeleteImage, folder, refetch]);

  // Filter images based on search term
  const filteredImages = useMemo(() => {
    if (!searchFilters.query?.trim()) {
      return galleryData?.images || [];
    }

    const query = searchFilters.query.toLowerCase();
    return galleryData?.images?.filter(image =>
      image.id.toLowerCase().includes(query) ||
      (image.fileName && image.fileName.toLowerCase().includes(query)) ||
      (image.tags && image.tags.some(tag => tag.toLowerCase().includes(query)))
    ) || [];
  }, [galleryData?.images, searchFilters.query]);

  // Regular image click - always opens preview mode
  const handleImageClick = useCallback((image: GalleryImage) => {
    if (comparisonMode) {
      if (comparisonImages.length < 2 && !comparisonImages.find(img => img.id === image.id)) {
        setComparisonImages(prev => [...prev, image]);
      }
    } else {
      // Always open preview mode for regular clicks
      const index = filteredImages.findIndex(img => img.id === image.id);
      setPreviewIndex(index);
      setPreviewMode(true);
    }
  }, [comparisonMode, comparisonImages, filteredImages]);

  // Eye icon click - opens metadata modal
  const handleEyeClick = useCallback((image: GalleryImage) => {
    setSelectedImage(image);
  }, []);

  const thumbnailSizeOptions = [
    { value: 'small', label: 'Small', icon: LayoutGrid },
    { value: 'medium', label: 'Medium', icon: Grid },
    { value: 'large', label: 'Large', icon: Eye }
  ] as const;

  const commonFolders = ['general', 'portraits', 'landscapes', 'products', 'events', 'nature'];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Rest of the JSX code... */}
    </div>
  );
};

export default Gallery;