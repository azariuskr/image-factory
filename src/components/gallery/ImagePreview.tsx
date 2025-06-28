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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, showInfo]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      resetView();
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
      resetView();
    }
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

  if (!isOpen || !currentImage) return null;

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
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
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
            disabled={currentIndex === 0}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronLeft className="h-6 w-6" />
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
            disabled={currentIndex === images.length - 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronRight className="h-6 w-6" />
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
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
            className="text-white hover:bg-white/20"
          >
            Reset
          </Button>
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
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(currentImage.id, currentImage.folder || 'general');
              onClose();
            }}
            className="text-white hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Image */}
        <div className="flex items-center justify-center h-full p-16">
          <motion.img
            key={currentImage.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentImage.url}
            alt={currentImage.fileName || 'Image'}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
            onClick={(e) => e.stopPropagation()}
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
                <h3 className="text-lg font-semibold">Image Details</h3>
                
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImagePreview;