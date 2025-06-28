import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Sliders, Eye, LayoutGrid, CheckSquare, Folder, Compare, Maximize2 } from 'lucide-react';
import { useGetGalleryQuery, useDeleteImageMutation } from '../store/api/apiSlice';
import { GalleryImage, SearchFilters, BulkOperation } from '../types/api';
import ImageGrid from '../components/gallery/ImageGrid';
import ImageModal from '../components/gallery/ImageModal';
import ImagePreview from '../components/gallery/ImagePreview';
import ImageComparison from '../components/gallery/ImageComparison';
import Pagination from '../components/gallery/Pagination';
import AdvancedSearch from '../components/search/AdvancedSearch';
import ImageFilters from '../components/gallery/ImageFilters';
import BulkOperations from '../components/bulk/BulkOperations';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const Gallery: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [folder, setFolder] = useState('general');
  const [pageSize, setPageSize] = useState(20);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [thumbnailSize, setThumbnailSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonImages, setComparisonImages] = useState<GalleryImage[]>([]);
  
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
      // Remove from selection if it was selected
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
    setSearchTerm('');
    setFolder('general');
    setCurrentPage(1);
    setSelectedIds([]);
  }, []);

  const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
    console.log('Bulk operation:', operation);
    // TODO: Implement bulk operations API calls
    
    // For now, just simulate the operation
    if (operation.type === 'delete') {
      // Delete selected images
      for (const id of operation.itemIds) {
        await handleDeleteImage(id, folder);
      }
    }
    
    setSelectedIds([]);
    refetch();
  }, [handleDeleteImage, folder, refetch]);

  const handleImageClick = useCallback((image: GalleryImage) => {
    if (comparisonMode) {
      if (comparisonImages.length < 2 && !comparisonImages.find(img => img.id === image.id)) {
        setComparisonImages(prev => [...prev, image]);
      }
    } else if (previewMode) {
      const index = filteredImages.findIndex(img => img.id === image.id);
      setPreviewIndex(index);
    } else {
      setSelectedImage(image);
    }
  }, [comparisonMode, previewMode, comparisonImages]);

  const handleStartComparison = useCallback(() => {
    setComparisonMode(true);
    setComparisonImages([]);
    setBulkMode(false);
  }, []);

  const handleStartPreview = useCallback(() => {
    setPreviewMode(true);
    setComparisonMode(false);
    setBulkMode(false);
  }, []);

  // Filter images based on search term
  const filteredImages = useMemo(() => {
    if (!searchFilters.query?.trim() && !searchTerm.trim()) {
      return galleryData?.images || [];
    }

    const query = (searchFilters.query || searchTerm).toLowerCase();
    return galleryData?.images?.filter(image =>
      image.id.toLowerCase().includes(query) ||
      (image.fileName && image.fileName.toLowerCase().includes(query)) ||
      (image.tags && image.tags.some(tag => tag.toLowerCase().includes(query)))
    ) || [];
  }, [galleryData?.images, searchFilters.query, searchTerm]);

  const thumbnailSizeOptions = [
    { value: 'small', label: 'Small', icon: LayoutGrid },
    { value: 'medium', label: 'Medium', icon: Grid },
    { value: 'large', label: 'Large', icon: Eye }
  ] as const;

  // Common folder suggestions
  const commonFolders = ['general', 'portraits', 'landscapes', 'products', 'events', 'nature'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Gallery</h1>
          <p className="text-gray-600 mt-1">
            {galleryData?.totalCount || 0} items in {searchFilters.folder || folder} folder
            {selectedIds.length > 0 && (
              <span className="ml-2 text-blue-600">
                • {selectedIds.length} selected
              </span>
            )}
            {comparisonMode && (
              <span className="ml-2 text-purple-600">
                • Comparison mode ({comparisonImages.length}/2 selected)
              </span>
            )}
            {previewMode && (
              <span className="ml-2 text-green-600">
                • Preview mode active
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Toggles */}
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPreviewMode(!previewMode);
              setComparisonMode(false);
              setBulkMode(false);
            }}
            className={previewMode ? 'bg-gradient-to-r from-green-600 to-blue-600' : ''}
          >
            <Maximize2 className="h-4 w-4 mr-1" />
            Preview
          </Button>

          <Button
            variant={comparisonMode ? 'default' : 'outline'}
            size="sm"
            onClick={handleStartComparison}
            className={comparisonMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
          >
            <Compare className="h-4 w-4 mr-1" />
            Compare
          </Button>

          {/* Bulk Mode Toggle */}
          <Button
            variant={bulkMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setBulkMode(!bulkMode);
              setSelectedIds([]);
              setComparisonMode(false);
              setPreviewMode(false);
            }}
            className={bulkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Bulk
          </Button>

          {/* Thumbnail Size Selector */}
          <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-lg p-1">
            {thumbnailSizeOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={thumbnailSize === value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setThumbnailSize(value)}
                className={thumbnailSize === value ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                <Icon className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Folder Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Folder className="h-5 w-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">
                  Current Folder:
                </label>
              </div>
              
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value || 'general')}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleFolderChange(folder);
                    }
                  }}
                  placeholder="Enter folder name..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  list="folder-suggestions"
                />
                <datalist id="folder-suggestions">
                  {commonFolders.map(folderName => (
                    <option key={folderName} value={folderName} />
                  ))}
                </datalist>
              </div>

              <Button
                onClick={() => handleFolderChange(folder)}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                size="sm"
              >
                Load Folder
              </Button>
            </div>

            {/* Quick folder buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-gray-500 mr-2">Quick access:</span>
              {commonFolders.map(folderName => (
                <Button
                  key={folderName}
                  type="button"
                  size="sm"
                  variant={folder === folderName ? 'default' : 'outline'}
                  onClick={() => handleFolderChange(folderName)}
                  className={`text-xs ${folder === folderName ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
                >
                  {folderName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdvancedSearch
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          isOpen={showAdvancedSearch}
          onToggle={() => setShowAdvancedSearch(!showAdvancedSearch)}
        />
      </motion.div>

      {/* Image Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <ImageFilters
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          onApply={handleSearch}
          onClear={handleClearFilters}
          isVisible={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />
      </motion.div>

      {/* Comparison Mode Instructions */}
      {comparisonMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-purple-800">Comparison Mode Active</h3>
              <p className="text-sm text-purple-600 mt-1">
                Select 2 images to compare them side by side. {comparisonImages.length}/2 selected.
              </p>
            </div>
            <div className="flex space-x-2">
              {comparisonImages.length === 2 && (
                <Button
                  size="sm"
                  onClick={() => setComparisonImages([])}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  View Comparison
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setComparisonMode(false);
                  setComparisonImages([]);
                }}
              >
                Exit Comparison
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gallery Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
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
          onDeleteImage={handleDeleteImage}
          isLoading={isLoading}
          viewMode={viewMode}
          thumbnailSize={thumbnailSize}
          bulkMode={bulkMode || comparisonMode}
          selectedIds={comparisonMode ? comparisonImages.map(img => img.id) : selectedIds}
          onSelectionChange={comparisonMode ? () => {} : setSelectedIds}
        />

        {/* Pagination */}
        {galleryData && !searchFilters.query && !searchTerm && (
          <Pagination
            currentPage={currentPage}
            totalPages={galleryData.totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}

        {/* Search Results Info */}
        {(searchFilters.query || searchTerm) && (
          <div className="mt-6 text-center text-gray-600">
            {filteredImages.length === 0 ? (
              <p>No images found matching your search criteria</p>
            ) : (
              <p>Found {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} matching your search</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Bulk Operations */}
      <BulkOperations
        images={filteredImages}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onBulkOperation={handleBulkOperation}
        isVisible={bulkMode}
      />

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        isOpen={selectedImage !== null && !previewMode}
        onClose={() => setSelectedImage(null)}
        onDelete={handleDeleteImage}
      />

      {/* Image Preview */}
      <ImagePreview
        images={filteredImages}
        currentIndex={previewIndex}
        isOpen={previewMode}
        onClose={() => setPreviewMode(false)}
        onDelete={handleDeleteImage}
        onIndexChange={setPreviewIndex}
      />

      {/* Image Comparison */}
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