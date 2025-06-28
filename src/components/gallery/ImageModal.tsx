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
  Loader
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
  // Fetch detailed metadata when modal opens
  const { data: metadata, isLoading: metadataLoading } = useGetImageMetadataQuery(
    { id: image?.id || '', folder: image?.folder || 'general' },
    { skip: !image?.id }
  );

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">
          Image Details - {image.fileName || `Image ${image.id}`}
        </DialogTitle>
        <DialogDescription className="sr-only">
          View and manage image details, download or delete the image
        </DialogDescription>

        <div className="flex flex-col md:flex-row h-full">
          {/* Image Section */}
          <div className="flex-1 bg-black relative">
            <img
              src={image.url}
              alt={image.fileName || `Image ${image.id}`}
              className="w-full h-full object-contain"
            />

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
          </div>

          {/* Info Panel */}
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="w-full md:w-80 bg-white p-6 overflow-y-auto"
          >
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

                <div>
                  <label className="text-sm font-medium text-gray-500">Image ID</label>
                  <p className="text-xs text-gray-600 font-mono break-all">{image.id}</p>
                </div>
              </div>
            )}

            {/* Processing Section - Placeholder for future implementation */}
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
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
