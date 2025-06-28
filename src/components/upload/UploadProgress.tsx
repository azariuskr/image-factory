import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Progress } from '../ui/progress';

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
  success: boolean;
  error: string | null;
  uploadedCount: number;
  totalCount: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  progress,
  success,
  error,
  uploadedCount,
  totalCount
}) => {
  if (!isUploading && !success && !error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6 space-y-4"
    >
      <div className="flex items-center space-x-3">
        {isUploading && (
          <>
            <Loader className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="font-medium text-gray-900">Uploading...</span>
          </>
        )}
        
        {success && (
          <>
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Upload Complete!</span>
          </>
        )}
        
        {error && (
          <>
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Upload Failed</span>
          </>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{uploadedCount} of {totalCount} files uploaded</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
          Successfully uploaded {uploadedCount} image{uploadedCount !== 1 ? 's' : ''}!
        </p>
      )}
    </motion.div>
  );
};

export default UploadProgress;