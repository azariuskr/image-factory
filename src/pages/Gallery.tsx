import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Sliders, Eye, LayoutGrid } from 'lucide-react';
import { useGetGalleryQuery, useDeleteImageMutation } from '../store/api/apiSlice';
import { GalleryImage } from '../types/api';
import ImageGrid from '../components/gallery/ImageGrid';
import ImageModal from '../components/gallery/ImageModal';
import Pagination from '../components/gallery/Pagination';
import FolderManager from '../components/folders/FolderManager';
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
  const [showFolders, setShowFolders] = useState(false);

  const { data: galleryData, isLoading, error, refetch } = useGetGalleryQuery({
    folder,
    page: currentPage,
    pageSize,
    thumbnailSize,
    format: 'webp'
  });

  const [deleteImage] = useDeleteImageMutation();

  const handleDeleteImage = useCallback(async (id: string, imageFolder: string) => {
    try {
      await deleteImage({ id, folder: imageFolder }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }, [deleteImage, refetch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFolderChange = useCallback((newFolder: string) => {
    setFolder(newFolder);
    setCurrentPage(1);
    setShowFolders(false);
  }, []);

  // Filter images based on search term
  const filteredImages = useMemo(() => {
    if (!searchTerm.trim()) {
      return galleryData?.images || [];
    }

    const searchLower = searchTerm.toLowerCase();
    return galleryData?.images?.filter(image =>
      image.id.toLowerCase().includes(searchLower) ||
      (image.fileName && image.fileName.toLowerCase().includes(searchLower)) ||
      (image.tags && image.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    ) || [];
  }, [galleryData?.images, searchTerm]);

  const thumbnailSizeOptions = [
    { value: 'small', label: 'Small', icon: LayoutGrid },
    { value: 'medium', label: 'Medium', icon: Grid },
    { value: 'large', label: 'Large', icon: Eye }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
          <p className="text-gray-600 mt-1">
            {galleryData?.totalCount || 0} images in {folder} folder
          </p>
        </div>

        <div className="flex items-center space-x-2">
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

          {/* Folders Toggle */}
          <Button
            variant={showFolders ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFolders(!showFolders)}
            className={showFolders ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Folders
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`lg:col-span-1 ${showFolders ? 'block' : 'hidden lg:block'}`}
        >
          <FolderManager
            selectedFolder={folder}
            onFolderSelect={handleFolderChange}
          />
        </motion.div>

        {/* Main Content */}
        <div className={`${showFolders ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="bg-white/60 backdrop-blur-sm border-white/40">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by filename, ID, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                  </div>

                  {/* Page Size */}
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  >
                    <option value={12}>12 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={36}>36 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gallery Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
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
              onImageClick={setSelectedImage}
              onDeleteImage={handleDeleteImage}
              isLoading={isLoading}
              viewMode={viewMode}
              thumbnailSize={thumbnailSize}
            />

            {/* Pagination */}
            {galleryData && !searchTerm && (
              <Pagination
                currentPage={currentPage}
                totalPages={galleryData.totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}

            {/* Search Results Info */}
            {searchTerm && (
              <div className="mt-6 text-center text-gray-600">
                {filteredImages.length === 0 ? (
                  <p>No images found matching "{searchTerm}"</p>
                ) : (
                  <p>Found {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} matching "{searchTerm}"</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        onDelete={handleDeleteImage}
      />
    </div>
  );
};

export default Gallery;