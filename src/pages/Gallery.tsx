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

  const thumbnailSizeOptions = [
    { value: 'small', label: 'Small', icon: LayoutGrid },
    { value: 'medium', label: 'Medium', icon: Grid },
    { value: 'large', label: 'Large', icon: Eye }
  ] as const;

  const commonFolders = ['general', 'portraits', 'landscapes', 'products', 'events', 'nature'];
  const commonTags = ['portrait', 'landscape', 'nature', 'urban', 'architecture', 'product', 'event', 'wedding', 'travel', 'macro'];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-80 bg-white/80 backdrop-blur-md shadow-xl border-r border-white/40 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/40">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Search */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <Search className="h-4 w-4 inline mr-2" />
                  Search Images
                </label>
                <input
                  type="text"
                  placeholder="Search by filename, ID, or tags..."
                  value={searchFilters.query || ''}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Folder Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <Folder className="h-4 w-4 inline mr-2" />
                  Current Folder
                </label>
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  list="folder-suggestions"
                />
                <datalist id="folder-suggestions">
                  {commonFolders.map(folderName => (
                    <option key={folderName} value={folderName} />
                  ))}
                </datalist>
                
                {/* Quick folder buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {commonFolders.map(folderName => (
                    <Button
                      key={folderName}
                      size="sm"
                      variant={folder === folderName ? 'default' : 'outline'}
                      onClick={() => handleFolderChange(folderName)}
                      className={`text-xs ${folder === folderName ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
                    >
                      {folderName}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Sort & Order
                </label>
                <div className="space-y-2">
                  <select
                    value={searchFilters.sortBy || 'date'}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="size">Size</option>
                    <option value="type">Type</option>
                  </select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={searchFilters.sortOrder === 'asc' ? 'default' : 'outline'}
                      onClick={() => setSearchFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
                      className={searchFilters.sortOrder === 'asc' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                    >
                      Ascending
                    </Button>
                    <Button
                      size="sm"
                      variant={searchFilters.sortOrder === 'desc' ? 'default' : 'outline'}
                      onClick={() => setSearchFilters(prev => ({ ...prev, sortOrder: 'desc' }))}
                      className={searchFilters.sortOrder === 'desc' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                    >
                      Descending
                    </Button>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={searchFilters.dateRange?.start || ''}
                      onChange={(e) => setSearchFilters(prev => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          start: e.target.value,
                          end: prev.dateRange?.end || ''
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={searchFilters.dateRange?.end || ''}
                      onChange={(e) => setSearchFilters(prev => ({
                        ...prev,
                        dateRange: {
                          start: prev.dateRange?.start || '',
                          end: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                  </div>
                </div>
              </div>

              {/* File Size Range */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  File Size (MB)
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                    <input
                      type="number"
                      min="0"
                      value={searchFilters.sizeRange?.min || ''}
                      onChange={(e) => setSearchFilters(prev => ({
                        ...prev,
                        sizeRange: {
                          ...prev.sizeRange,
                          min: Number(e.target.value),
                          max: prev.sizeRange?.max || 0
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                    <input
                      type="number"
                      min="0"
                      value={searchFilters.sizeRange?.max || ''}
                      onChange={(e) => setSearchFilters(prev => ({
                        ...prev,
                        sizeRange: {
                          min: prev.sizeRange?.min || 0,
                          max: Number(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Quick Filters
                </label>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchFilters(prev => ({
                      ...prev,
                      dateRange: {
                        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        end: new Date().toISOString().split('T')[0]
                      }
                    }))}
                    className="w-full justify-start"
                  >
                    Last 7 days
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchFilters(prev => ({
                      ...prev,
                      dateRange: {
                        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        end: new Date().toISOString().split('T')[0]
                      }
                    }))}
                    className="w-full justify-start"
                  >
                    Last 30 days
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchFilters(prev => ({
                      ...prev,
                      sizeRange: { min: 0, max: 5 }
                    }))}
                    className="w-full justify-start"
                  >
                    Small files (&lt; 5MB)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchFilters(prev => ({
                      ...prev,
                      sizeRange: { min: 10, max: 1000 }
                    }))}
                    className="w-full justify-start"
                  >
                    Large files (&gt; 10MB)
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-10 w-10"
              >
                {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Title and Stats */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
                <p className="text-sm text-gray-600">
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
            </div>

            {/* View Controls */}
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
                onClick={() => {
                  setComparisonMode(!comparisonMode);
                  setComparisonImages([]);
                  setPreviewMode(false);
                  setBulkMode(false);
                }}
                className={comparisonMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
              >
                <Compare className="h-4 w-4 mr-1" />
                Compare
              </Button>

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

              {/* Thumbnail Size */}
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
                  </Button>
                ))}
              </div>

              {/* View Mode */}
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
          </div>
        </div>

        {/* Comparison Mode Instructions */}
        {comparisonMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-50 border-b border-purple-200 p-4"
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
        isOpen={selectedImage !== null && !previewMode}
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