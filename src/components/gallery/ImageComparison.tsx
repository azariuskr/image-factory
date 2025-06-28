import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { GalleryImage } from '../../types/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface ImageComparisonProps {
  images: GalleryImage[];
  isOpen: boolean;
  onClose: () => void;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({
  images,
  isOpen,
  onClose
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen || images.length !== 2) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-6xl bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Image Comparison</h2>
            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSliderPosition(50)}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
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

          <div
            className="relative w-full h-96 overflow-hidden rounded-lg cursor-col-resize"
            onMouseMove={handleMouseMove}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {/* First Image */}
            <div className="absolute inset-0">
              <img
                src={images[0].url}
                alt={images[0].fileName || 'Image 1'}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Second Image with Clip Path */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)`
              }}
            >
              <img
                src={images[1].url}
                alt={images[1].fileName || 'Image 2'}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-col-resize"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="w-1 h-4 bg-gray-600 rounded"></div>
                <div className="w-1 h-4 bg-gray-600 rounded ml-1"></div>
              </div>
            </div>
          </div>

          {/* Image Info */}
          <div className="grid grid-cols-2 gap-4 mt-6 text-white text-sm">
            <div className="space-y-1">
              <h3 className="font-medium">Image 1</h3>
              <p className="text-gray-300">{images[0].fileName || 'Unknown'}</p>
              {images[0].fileSize && (
                <p className="text-gray-400">
                  {(images[0].fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">Image 2</h3>
              <p className="text-gray-300">{images[1].fileName || 'Unknown'}</p>
              {images[1].fileSize && (
                <p className="text-gray-400">
                  {(images[1].fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-gray-400 text-sm">
            Drag the slider to compare images • Position: {sliderPosition.toFixed(0)}%
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ImageComparison;