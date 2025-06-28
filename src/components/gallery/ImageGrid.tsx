import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Download,
  Trash2,
  MoreHorizontal,
  Calendar,
  FileText,
  Maximize
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
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onImageClick,
  onDeleteImage,
  isLoading = false
}) => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg aspect-square mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
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
            <div className="relative aspect-square overflow-hidden">
              <img
                src={image.thumbnailUrl || image.url}
                alt={image.fileName || `Image ${image.id}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />

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
            </div>

            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate mb-2">
                {image.fileName || `Image ${image.id}`}
              </h3>

              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{image.fileSize ? formatFileSize(image.fileSize) : 'Unknown size'}</span>
                </div>
                {image.uploadedAt && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(image.uploadedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ImageGrid;
