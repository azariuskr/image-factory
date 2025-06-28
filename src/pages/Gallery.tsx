import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useGetGalleryQuery, useDeleteImageMutation } from '../store/api/apiSlice';
import { GalleryImage } from '../types/api';
import ImageGrid from '../components/gallery/ImageGrid';
import ImageModal from '../components/gallery/ImageModal';
import Pagination from '../components/gallery/Pagination';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const Gallery: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [folder, setFolder] = useState('general');
  const [pageSize, setPageSize] = useState(20);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: galleryData, isLoading, error, refetch } = useGetGalleryQuery({
    folder,
    page: currentPage,
    pageSize,
    w: 500, // Thumbnail width
    h: 500, // Thumbnail height
    format: 'webp'
  });

  const [deleteImage] = useDeleteImageMutation();

  const handleDeleteImage = async (id: string, imageFolder: string) => {
    try {
      await deleteImage({ id, folder: imageFolder }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filter images based on search term (limited since we only have URLs)
  const filteredImages = galleryData?.images?.filter(image =>
    image.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (image.fileName && image.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
          <p className="text-gray-600 mt-1">
            {galleryData?.totalCount || 0} images in {folder} folder
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by image ID or filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                />
              </div>

              {/* Folder Filter */}
              <select
                value={folder}
                onChange={(e) => {
                  setFolder(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              >
                <option value="general">General</option>
                <option value="portraits">Portraits</option>
                <option value="landscapes">Landscapes</option>
                <option value="products">Products</option>
              </select>

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
        transition={{ delay: 0.2 }}
      >
        {error && (
          <Card className="bg-red-50 border-red-200">
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
        />

        {/* Pagination */}
        {galleryData && (
          <Pagination
            currentPage={currentPage}
            totalPages={galleryData.totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}
      </motion.div>

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
