import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Download,
  Trash2,
  Info,
  Calendar,
  FileText,
  Folder,
  Image as ImageIcon,
  Loader,
  Tag,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2
} from 'lucide-react';
import { GalleryImage, ImageMetadata } from '../../types/api';
import { formatFileSize, formatDate } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { useGetImageMetadataQuery } from '../../store/api/apiSlice';

interface ImageModalProps {
  image: GalleryImage | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string, folder: string) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  image,
  isOpen,
  onClose,
  onDelete
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch detailed metadata when modal opens
  const { data: metadata, isLoading: metadataLoading } = useGetImageMetadataQuery(
    { id: image?.id || '', folder: image?.folder || 'general' },
    { skip: !image?.id }
  );

  // Reset zoom and rotation when image changes
  useEffect(() => {
    if (image) {
      setZoom(1);
      setRotation(0);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [image?.id]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleResetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full max-h-[95vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">
          Image Details - {image.fileName || `Image ${image.id}`}
        </DialogTitle>
        <DialogDescription className="sr-only">
          View and manage image details, download or delete the image
        </DialogDescription>

        <div className="flex flex-col lg:flex-row h-full max-h-[95vh]">
          {/* Image Section */}
          <div className="flex-1 bg-black relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {!imageLoaded && !imageError && (
                <div className="flex items-center space-x-2 text-white">
                  <Loader className="h-6 w-6 animate-spin" />
                  <span>Loading image...</span>
                </div>
              )}

              {imageError && (
                <div className="text-white text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Failed to load image</p>
                </div>
              )}

              <img
                src={image.url}
                alt={image.fileName || `Image ${image.id}`}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  display: imageLoaded ? 'block' : 'none'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>

            {/* Image Controls */}
            <div className="absolute top-4 left-4 flex space-x-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleZoomIn}
                className="bg-black/50 hover:bg-black/70 text-white"
                disabled={zoom >= 5}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleZoomOut}
                className="bg-black/50 hover:bg-black/70 text-white"
                disabled={zoom <= 0.1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRotate}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleResetView}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
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
                onClick={() => {
                  onDelete(image.id, image.folder || 'general');
                  onClose();
                }}
                className="bg-red-500/90 hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom indicator */}
            {zoom !== 1 && (
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {Math.round(zoom * 100)}%
              </div>
            )}
          </div>

          {/* Info Panel */}
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="w-full lg:w-96 bg-white overflow-y-auto max-h-[95vh]"
          >
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Info className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Image Details</h2>
              </div>

              {metadataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading details...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Filename</label>
                      <p className="text-sm text-gray-900 break-all">
                        {metadata?.fileName || image.fileName || `image-${image.id}`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Size</label>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3 text-gray-400" />
                          <p className="text-sm text-gray-900">
                            {metadata?.fileSize ? formatFileSize(metadata.fileSize) : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <div className="flex items-center space-x-1">
                          <ImageIcon className="h-3 w-3 text-gray-400" />
                          <p className="text-sm text-gray-900">
                            {metadata?.contentType || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {metadata?.width && metadata?.height && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Dimensions</label>
                        <p className="text-sm text-gray-900">
                          {metadata.width} × {metadata.height} pixels
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-500">Folder</label>
                      <div className="flex items-center space-x-1">
                        <Folder className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-900">{image.folder || 'general'}</p>
                      </div>
                    </div>

                    {metadata?.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <p className="text-sm text-gray-900">{formatDate(metadata.createdAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {metadata?.tags && metadata.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {metadata.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {metadata?.metadata && Object.keys(metadata.metadata).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Metadata</label>
                      <div className="space-y-2">
                        {Object.entries(metadata.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="text-gray-900 break-all">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Details */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Technical Details</label>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Image ID:</span>
                        <span className="font-mono break-all">{image.id}</span>
                      </div>
                      {metadata?.eTag && (
                        <div className="flex justify-between">
                          <span>ETag:</span>
                          <span className="font-mono break-all">{metadata.eTag}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Section */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Image Processing</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Apply filters, resize, or convert this image
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Process Image (Coming Soon)
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;