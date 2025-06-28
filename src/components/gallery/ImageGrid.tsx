import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Download,
  Trash2,
  Calendar,
  FileText,
  Maximize,
  Tag,
  Info
} from 'lucide-react';
import { GalleryImage } from '../../types/api';
import { formatFileSize, formatDate } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface ImageGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
  onDeleteImage: (id: string, folder: string) => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  thumbnailSize?: 'small' | 'medium' | 'large';
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onImageClick,
  onDeleteImage,
  isLoading = false,
  viewMode = 'grid',
  thumbnailSize = 'medium'
}) => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  }, []);

  const handleImageError = useCallback((imageId: string) => {
    console.warn(`Failed to load image: ${imageId}`);
  }, []);

  // Memoize grid configuration based on thumbnail size
  const gridConfig = useMemo(() => {
    const configs = {
      small: {
        gridCols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
        aspectRatio: 'aspect-square',
        gap: 'gap-3'
      },
      medium: {
        gridCols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        aspectRatio: 'aspect-square',
        gap: 'gap-4'
      },
      large: {
        gridCols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        aspectRatio: 'aspect-[4/3]',
        gap: 'gap-6'
      }
    };
    return configs[thumbnailSize];
  }, [thumbnailSize]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className={`grid ${gridConfig.gridCols} ${gridConfig.gap}`}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className={`bg-gray-200 rounded-lg ${gridConfig.aspectRatio} mb-3`}></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {images.map((image) => (
          <motion.div
            key={image.id}
            variants={itemVariants}
            className="group"
          >
            <Card className="overflow-hidden bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-lg border-white/40">
              <div className="flex items-center p-4 space-x-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <img
                    src={image.thumbnailUrl}
                    alt={image.fileName || `Image ${image.id}`}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                    onLoad={() => handleImageLoad(image.id)}
                    onError={() => handleImageError(image.id)}
                  />
                  {!loadedImages.has(image.id) && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {image.fileName || `Image ${image.id}`}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    {image.fileSize && (
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{formatFileSize(image.fileSize)}</span>
                      </div>
                    )}
                    {image.uploadedAt && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(image.uploadedAt)}</span>
                      </div>
                    )}
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Tag className="h-3 w-3" />
                        <span>{image.tags.length} tags</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => onImageClick(image)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => window.open(image.url, '_blank')}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => onDeleteImage(image.id, image.folder || 'general')}
                    className="bg-red-500/90 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`grid ${gridConfig.gridCols} ${gridConfig.gap}`}
    >
      {images.map((image) => (
        <motion.div
          key={image.id}
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="group"
        >
          <Card
            className="overflow-hidden bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-xl border-white/40"
            onMouseEnter={() => setHoveredImage(image.id)}
            onMouseLeave={() => setHoveredImage(null)}
          >
            <div className={`relative ${gridConfig.aspectRatio} overflow-hidden`}>
              <img
                src={image.thumbnailUrl}
                alt={image.fileName || `Image ${image.id}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onLoad={() => handleImageLoad(image.id)}
                onError={() => handleImageError(image.id)}
              />

              {!loadedImages.has(image.id) && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

              <AnimatePresence>
                {hoveredImage === image.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => onImageClick(image)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => window.open(image.url, '_blank')}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => onDeleteImage(image.id, image.folder || 'general')}
                        className="bg-red-500/90 hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image info overlay */}
              {thumbnailSize === 'large' && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="text-white text-sm">
                    <p className="font-medium truncate">
                      {image.fileName || `Image ${image.id}`}
                    </p>
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Tag className="h-3 w-3" />
                        <span className="text-xs opacity-80">
                          {image.tags.slice(0, 2).join(', ')}
                          {image.tags.length > 2 && ` +${image.tags.length - 2}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {thumbnailSize !== 'small' && (
              <div className="p-3">
                <h3 className="font-medium text-gray-900 truncate mb-2">
                  {image.fileName || `Image ${image.id}`}
                </h3>

                <div className="space-y-1 text-xs text-gray-500">
                  {image.fileSize && (
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{formatFileSize(image.fileSize)}</span>
                    </div>
                  )}
                  {image.uploadedAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(image.uploadedAt)}</span>
                    </div>
                  )}
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>{image.tags.length} tags</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ImageGrid;