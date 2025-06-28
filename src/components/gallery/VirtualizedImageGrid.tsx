import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { motion } from 'framer-motion';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Eye,
  Download,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import { GalleryImage } from '../../types/api';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useImageCache } from '../../hooks/useImageCache';

interface VirtualizedImageGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
  onDeleteImage: (id: string, folder: string) => void;
  isLoading?: boolean;
  thumbnailSize?: 'small' | 'medium' | 'large';
  bulkMode?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

interface ImageCellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    images: GalleryImage[];
    columnsPerRow: number;
    onImageClick: (image: GalleryImage) => void;
    onDeleteImage: (id: string, folder: string) => void;
    thumbnailSize: 'small' | 'medium' | 'large';
    bulkMode: boolean;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  };
}

const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}> = ({ src, alt, className, onLoad, onError }) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });
  const { getCachedImage } = useImageCache();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isIntersecting && src && !imageSrc) {
      getCachedImage(src).then(cachedSrc => {
        setImageSrc(cachedSrc);
      }).catch(() => {
        setImageSrc(src);
      });
    }
  }, [isIntersecting, src, imageSrc, getCachedImage]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
};

const ImageCell: React.FC<ImageCellProps> = ({ columnIndex, rowIndex, style, data }) => {
  const {
    images,
    columnsPerRow,
    onImageClick,
    onDeleteImage,
    thumbnailSize,
    bulkMode,
    selectedIds,
    onSelectionChange
  } = data;

  const imageIndex = rowIndex * columnsPerRow + columnIndex;
  const image = images[imageIndex];

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  if (!image) {
    return <div style={style} />;
  }

  const isSelected = selectedIds.includes(image.id);

  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  }, []);

  const handleImageSelect = useCallback((imageId: string, event: React.MouseEvent) => {
    if (!bulkMode) return;
    
    event.stopPropagation();
    
    if (selectedIds.includes(imageId)) {
      onSelectionChange(selectedIds.filter(id => id !== imageId));
    } else {
      onSelectionChange([...selectedIds, imageId]);
    }
  }, [bulkMode, selectedIds, onSelectionChange]);

  const handleImageClick = useCallback((image: GalleryImage, event: React.MouseEvent) => {
    if (bulkMode) {
      handleImageSelect(image.id, event);
    } else {
      onImageClick(image);
    }
  }, [bulkMode, handleImageSelect, onImageClick]);

  return (
    <div style={style} className="p-2">
      <motion.div
        whileHover={{ y: -2 }}
        className="group h-full"
      >
        <Card
          className={`overflow-hidden bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-xl border-white/40 cursor-pointer h-full ${
            isSelected ? 'ring-2 ring-blue-500 bg-blue-50/60' : ''
          }`}
          onMouseEnter={() => setHoveredImage(image.id)}
          onMouseLeave={() => setHoveredImage(null)}
          onClick={(e) => handleImageClick(image, e)}
        >
          <div className="relative aspect-square overflow-hidden">
            {/* Selection Checkbox */}
            {bulkMode && (
              <div className="absolute top-2 left-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleImageSelect(image.id, e)}
                  className="p-1 bg-white/80 hover:bg-white h-8 w-8"
                >
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-600" />
                  )}
                </Button>
              </div>
            )}

            <LazyImage
              src={image.thumbnailUrl}
              alt={image.fileName || `Image ${image.id}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onLoad={() => handleImageLoad(image.id)}
            />

            {!bulkMode && hoveredImage === image.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
              >
                {/* Action buttons positioned at the bottom */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick(image);
                    }}
                    className="bg-white/90 hover:bg-white h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(image.url, '_blank');
                    }}
                    className="bg-white/90 hover:bg-white h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage(image.id, image.folder || 'general');
                    }}
                    className="bg-red-500/90 hover:bg-red-600 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {thumbnailSize !== 'small' && !bulkMode && (
            <div className="p-3">
              <h3 className="font-medium text-gray-900 truncate text-sm">
                {image.fileName || `Image ${image.id}`}
              </h3>
              
              {image.fileSize && (
                <p className="text-xs text-gray-500 mt-1">
                  {(image.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

const VirtualizedImageGrid: React.FC<VirtualizedImageGridProps> = ({
  images,
  onImageClick,
  onDeleteImage,
  isLoading = false,
  thumbnailSize = 'medium',
  bulkMode = false,
  selectedIds = [],
  onSelectionChange = () => {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { preloadImage } = useImageCache();

  // Calculate grid dimensions based on thumbnail size
  const gridConfig = useMemo(() => {
    const configs = {
      small: { itemSize: 180, columnsPerRow: 6 },
      medium: { itemSize: 240, columnsPerRow: 4 },
      large: { itemSize: 320, columnsPerRow: 3 }
    };
    return configs[thumbnailSize];
  }, [thumbnailSize]);

  // Preload images that are about to come into view
  useEffect(() => {
    const preloadCount = 10; // Preload next 10 images
    const startIndex = Math.max(0, images.length - preloadCount);
    
    for (let i = startIndex; i < images.length; i++) {
      if (images[i]?.thumbnailUrl) {
        preloadImage(images[i].thumbnailUrl);
      }
    }
  }, [images, preloadImage]);

  const itemData = useMemo(() => ({
    images,
    columnsPerRow: gridConfig.columnsPerRow,
    onImageClick,
    onDeleteImage,
    thumbnailSize,
    bulkMode,
    selectedIds,
    onSelectionChange
  }), [
    images,
    gridConfig.columnsPerRow,
    onImageClick,
    onDeleteImage,
    thumbnailSize,
    bulkMode,
    selectedIds,
    onSelectionChange
  ]);

  const rowCount = Math.ceil(images.length / gridConfig.columnsPerRow);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg aspect-square mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No images found</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-[600px] w-full">
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            columnCount={gridConfig.columnsPerRow}
            columnWidth={width / gridConfig.columnsPerRow}
            height={height}
            rowCount={rowCount}
            rowHeight={gridConfig.itemSize}
            width={width}
            itemData={itemData}
            overscanRowCount={2}
            overscanColumnCount={2}
          >
            {ImageCell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedImageGrid;