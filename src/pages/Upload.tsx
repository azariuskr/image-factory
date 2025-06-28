import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  useUploadImageMutation,
  useUploadBatchMutation,
  useGetFoldersQuery
} from '../store/api/apiSlice';
import UploadZone from '../components/upload/UploadZone';
import UploadProgress from '../components/upload/UploadProgress';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tag, Plus, X } from 'lucide-react';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [folder, setFolder] = useState('general');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState({
    isUploading: false,
    progress: 0,
    success: false,
    error: null as string | null,
    uploadedCount: 0,
    totalCount: 0
  });

  const { data: foldersData } = useGetFoldersQuery();
  const [uploadImage] = useUploadImageMutation();
  const [uploadBatch] = useUploadBatchMutation();

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddMetadata = () => {
    const key = prompt('Enter metadata key:');
    const value = prompt('Enter metadata value:');
    if (key && value) {
      setMetadata({ ...metadata, [key]: value });
    }
  };

  const handleRemoveMetadata = (key: string) => {
    const newMetadata = { ...metadata };
    delete newMetadata[key];
    setMetadata(newMetadata);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploadProgress({
      isUploading: true,
      progress: 0,
      success: false,
      error: null,
      uploadedCount: 0,
      totalCount: files.length
    });

    try {
      if (files.length === 1) {
        // Single file upload
        await uploadImage({
          file: files[0],
          folder,
          priority: 'Normal',
          tags: tags.length > 0 ? tags : undefined,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined
        }).unwrap();

        setUploadProgress(prev => ({
          ...prev,
          isUploading: false,
          success: true,
          progress: 100,
          uploadedCount: 1
        }));
      } else {
        // Batch upload
        const result = await uploadBatch({
          files,
          folder,
          tags: tags.length > 0 ? tags : undefined,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined
        }).unwrap();

        const successful = result?.successful || [];
        const errors = result?.errors || [];

        setUploadProgress(prev => ({
          ...prev,
          isUploading: false,
          success: true,
          progress: 100,
          uploadedCount: successful.length
        }));

        if (errors.length > 0) {
          setUploadProgress(prev => ({
            ...prev,
            error: `${errors.length} files failed to upload`
          }));
        }
      }

      // Clear form and redirect after successful upload
      setTimeout(() => {
        setFiles([]);
        setTags([]);
        setMetadata({});
        setUploadProgress({
          isUploading: false,
          progress: 0,
          success: false,
          error: null,
          uploadedCount: 0,
          totalCount: 0
        });
        navigate('/');
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({
        ...prev,
        isUploading: false,
        error: error.data?.error || error.message || 'Upload failed. Please try again.'
      }));
    }
  };

  const folders = foldersData?.folders || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Upload Images</h1>
        <p className="text-gray-600 mt-1">
          Add new images to your gallery with tags and metadata
        </p>
      </motion.div>

      {/* Upload Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle>Upload Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Folder Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Folder
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              >
                <option value="general">General</option>
                {folders.map((folderInfo) => (
                  <option key={folderInfo.name} value={folderInfo.name}>
                    {folderInfo.name} ({folderInfo.imageCount} images)
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Metadata
              </label>
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleAddMetadata}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metadata
                </Button>
                
                {Object.keys(metadata).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{key}:</span>
                        <span className="text-sm text-gray-900 flex-1">{value}</span>
                        <button
                          onClick={() => handleRemoveMetadata(key)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardContent className="p-6">
            <UploadZone
              files={files}
              onFilesChange={setFiles}
              maxFiles={10}
              accept="image/*"
              maxSize={52428800} // 50MB
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload Progress */}
      <UploadProgress
        isUploading={uploadProgress.isUploading}
        progress={uploadProgress.progress}
        success={uploadProgress.success}
        error={uploadProgress.error}
        uploadedCount={uploadProgress.uploadedCount}
        totalCount={uploadProgress.totalCount}
      />

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end space-x-4"
      >
        <Button
          variant="outline"
          onClick={() => {
            setFiles([]);
            setTags([]);
            setMetadata({});
          }}
          disabled={files.length === 0 || uploadProgress.isUploading}
        >
          Clear All
        </Button>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploadProgress.isUploading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {uploadProgress.isUploading ? 'Uploading...' : `Upload ${files.length} Image${files.length !== 1 ? 's' : ''}`}
        </Button>
      </motion.div>
    </div>
  );
};

export default Upload;