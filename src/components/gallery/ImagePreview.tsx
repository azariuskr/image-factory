import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Download, Trash2, Info, ZoomIn, ZoomOut, RotateCw, Share2 } from 'lucide-react';
import { GalleryImage } from '../../types/api';
import { Button } from '../ui/button';

interface ImagePreviewProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string, folder: string) => void;
  onIndexChange: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onDelete,
  onIndexChange
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Prevent default behavior for arrow keys
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'i':
        case 'I':
          setShowInfo(!showInfo);
          break;
        case ' ': // Spacebar
          e.preventDefault();
          handleNext();
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
      // Prevent scrolling when preview is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, showInfo, currentIndex, images.length]);

  const handlePrevious = () => {
    if (images.length === 0) return;
    
    // Infinite loop: if at first image, go to last
    const newIndex = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
    onIndexChange(newIndex);
    resetView();
  };

  const handleNext = () => {
    if (images.length === 0) return;
    
    // Infinite loop: if at last image, go to first
    const newIndex = currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
    onIndexChange(newIndex);
    resetView();
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleShare = async () => {
    if (navigator.share && currentImage) {
      try {
        await navigator.share({
          title: currentImage.fileName || 'Image',
          url: currentImage.url
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(currentImage.url);
      }
    }
  };

  if (!isOpen || !currentImage || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Navigation */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-2 text-white">
            <span className="text-sm">
              {currentIndex + 1} of {images.length}
            </span>
            <span className="text-xs text-gray-300">
              • Use ← → arrow keys to navigate
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(!showInfo);
              }}
              className="text-white hover:bg-white/20"
              title="Toggle info (I)"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="text-white hover:bg-white/20"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Controls */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="text-white hover:bg-white/20 h-12 w-12"
            title="Previous image (←)"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        </div>

        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="text-white hover:bg-white/20 h-12 w-12"
            title="Next image (→)"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-4 flex space-x-2 z-10">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(prev => Math.min(prev * 1.2, 5));
            }}
            className="text-white hover:bg-white/20"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(prev => Math.max(prev / 1.2, 0.1));
            }}
            className="text-white hover:bg-white/20"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setRotation(prev => (prev + 90) % 360);
            }}
            className="text-white hover:bg-white/20"
            title="Rotate"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
            className="text-white hover:bg-white/20 px-3"
            title="Reset view"
          >
            Reset
          </Button>
          
          {/* Zoom indicator */}
          {zoom !== 1 && (
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              window.open(currentImage.url, '_blank');
            }}
            className="text-white hover:bg-white/20"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(currentImage.id, currentImage.folder || 'general');
              // If this was the last image, close preview
              if (images.length <= 1) {
                onClose();
              } else {
                // Move to next image, or previous if we're at the end
                const newIndex = currentIndex >= images.length - 1 ? 0 : currentIndex;
                onIndexChange(newIndex);
              }
            }}
            className="text-white hover:bg-red-500/20"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Image */}
        <div className="flex items-center justify-center h-full p-16">
          <motion.img
            key={`${currentImage.id}-${currentIndex}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            src={currentImage.url}
            alt={currentImage.fileName || 'Image'}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              console.error('Failed to load image:', currentImage.url);
            }}
          />
        </div>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="absolute top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-sm p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-white space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Image Details</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowInfo(false)}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-300">Filename:</span>
                    <p className="break-all">{currentImage.fileName || 'Unknown'}</p>
                  </div>
                  
                  {currentImage.fileSize && (
                    <div>
                      <span className="text-gray-300">Size:</span>
                      <p>{(currentImage.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-300">Folder:</span>
                    <p>{currentImage.folder || 'general'}</p>
                  </div>
                  
                  {currentImage.uploadedAt && (
                    <div>
                      <span className="text-gray-300">Uploaded:</span>
                      <p>{new Date(currentImage.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {currentImage.tags && currentImage.tags.length > 0 && (
                    <div>
                      <span className="text-gray-300">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentImage.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-600/50 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentImage.width && currentImage.height && (
                    <div>
                      <span className="text-gray-300">Dimensions:</span>
                      <p>{currentImage.width} × {currentImage.height} pixels</p>
                    </div>
                  )}
                </div>

                {/* Navigation shortcuts */}
                <div className="pt-4 border-t border-gray-600">
                  <h4 className="text-sm font-medium mb-2">Keyboard Shortcuts</h4>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>← →</span>
                      <span>Navigate images</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Space</span>
                      <span>Next image</span>
                    </div>
                    <div className="flex justify-between">
                      <span>I</span>
                      <span>Toggle info</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Esc</span>
                      <span>Close preview</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator for next/previous images */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-75">
          {images.length > 1 && (
            <span>
              Image {currentIndex + 1} of {images.length} • Infinite loop enabled
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImagePreview;