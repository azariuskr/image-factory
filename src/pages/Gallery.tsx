import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGetGalleryQuery, useDeleteImageMutation } from '../store/api/apiSlice';
import { GalleryImage, SearchFilters, BulkOperation } from '../types/api';
import ImageGrid from '../components/gallery/ImageGrid';
import ImageModal from '../components/gallery/ImageModal';
import ImagePreview from '../components/gallery/ImagePreview';
import ImageComparison from '../components/gallery/ImageComparison';
import Pagination from '../components/gallery/Pagination';
import BulkOperations from '../components/bulk/BulkOperations';
import GallerySidebar from '../components/gallery/GallerySidebar';
import GalleryTopBar from '../components/gallery/GalleryTopBar';
import ComparisonBanner from '../components/gallery/ComparisonBanner';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

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

  const handleToggleComparison = useCallback(() => {
    setComparisonMode(!comparisonMode);
    setComparisonImages([]);
    setBulkMode(false);
  }, [comparisonMode]);

  const handleToggleBulk = useCallback(() => {
    setBulkMode(!bulkMode);
    setSelectedIds([]);
    setComparisonMode(false);
  }, [bulkMode]);

  const handleClearComparison = useCallback(() => {
    setComparisonImages([]);
  }, []);

  const handleExitComparison = useCallback(() => {
    setComparisonImages([]);
    setComparisonMode(false);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <GallerySidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            searchFilters={searchFilters}
            onSearchFiltersChange={setSearchFilters}
            folder={folder}
            onFolderChange={handleFolderChange}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <GalleryTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          totalCount={galleryData?.totalCount || 0}
          folder={searchFilters.folder || folder}
          selectedCount={selectedIds.length}
          comparisonMode={comparisonMode}
          comparisonCount={comparisonImages.length}
          onToggleComparison={handleToggleComparison}
          bulkMode={bulkMode}
          onToggleBulk={handleToggleBulk}
          thumbnailSize={thumbnailSize}
          onThumbnailSizeChange={setThumbnailSize}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Comparison Mode Instructions */}
        {comparisonMode && (
          <ComparisonBanner
            comparisonImages={comparisonImages}
            onClearComparison={handleClearComparison}
            onExitComparison={handleExitComparison}
          />
        )}

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <Card className="bg-red-50 border-red-200 mb-6">
              <CardContent className="p-4">
                <p className="text-red-600">Failed to load images. Please try again.</p>
                <Button onClick={() => refetch()} className="mt-2">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          <ImageGrid
            images={filteredImages}
            onImageClick={handleImageClick}
            onEyeClick={handleEyeClick}
            onDeleteImage={handleDeleteImage}
            isLoading={isLoading}
            viewMode={viewMode}
            thumbnailSize={thumbnailSize}
            bulkMode={bulkMode || comparisonMode}
            selectedIds={comparisonMode ? comparisonImages.map(img => img.id) : selectedIds}
            onSelectionChange={comparisonMode ? () => {} : setSelectedIds}
          />

          {/* Pagination */}
          {galleryData && !searchFilters.query && (
            <Pagination
              currentPage={currentPage}
              totalPages={galleryData.totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}

          {/* Search Results Info */}
          {searchFilters.query && (
            <div className="mt-6 text-center text-gray-600">
              {filteredImages.length === 0 ? (
                <p>No images found matching your search criteria</p>
              ) : (
                <p>Found {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} matching your search</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        images={filteredImages}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onBulkOperation={handleBulkOperation}
        isVisible={bulkMode}
      />

      {/* Modals */}
      <ImageModal
        image={selectedImage}
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        onDelete={handleDeleteImage}
      />

      <ImagePreview
        images={filteredImages}
        currentIndex={previewIndex}
        isOpen={previewMode}
        onClose={() => setPreviewMode(false)}
        onDelete={handleDeleteImage}
        onIndexChange={setPreviewIndex}
      />

      <ImageComparison
        images={comparisonImages}
        isOpen={comparisonImages.length === 2}
        onClose={() => {
          setComparisonImages([]);
          setComparisonMode(false);
        }}
      />
    </div>
  );
};

export default Gallery;