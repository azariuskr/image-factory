import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image, X } from 'lucide-react';
import { formatFileSize } from '../../lib/utils';
import { Button } from '../ui/button';

interface UploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  maxSize?: number;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  files,
  onFilesChange,
  maxFiles = 10,
  accept = 'image/*',
  maxSize = 52428800 // 50MB
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    onFilesChange(newFiles);
  }, [files, onFilesChange, maxFiles]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    multiple: maxFiles > 1
  });

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            className="bg-blue-100 p-4 rounded-full"
          >
            <Upload className="h-8 w-8 text-blue-600" />
          </motion.div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Images'}
            </h3>
            <p className="text-gray-500">
              Drag and drop your images here, or click to browse
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>
        </div>
      </motion.div>

      {/* File List */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="font-medium text-gray-900">Selected Files ({files.length})</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border"
              >
                <div className="flex-shrink-0">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UploadZone;