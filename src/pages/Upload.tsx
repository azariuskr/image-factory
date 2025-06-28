// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import {
//   useUploadImageMutation,
//   useUploadBatchMutation
// } from '../store/api/apiSlice';
// import UploadZone from '../components/upload/UploadZone';
// import UploadProgress from '../components/upload/UploadProgress';
// import { Button } from '../components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

// const Upload: React.FC = () => {
//   const navigate = useNavigate();
//   const [files, setFiles] = useState<File[]>([]);
//   const [folder, setFolder] = useState('general');
//   const [uploadProgress, setUploadProgress] = useState({
//     isUploading: false,
//     progress: 0,
//     success: false,
//     error: null as string | null,
//     uploadedCount: 0,
//     totalCount: 0
//   });

//   const [uploadImage] = useUploadImageMutation();
//   const [uploadBatch] = useUploadBatchMutation();

//   const handleUpload = async () => {
//     if (files.length === 0) return;

//     setUploadProgress({
//       isUploading: true,
//       progress: 0,
//       success: false,
//       error: null,
//       uploadedCount: 0,
//       totalCount: files.length
//     });

//     try {
//       if (files.length === 1) {
//         // Single file upload
//         await uploadImage({
//           file: files[0],
//           folder,
//           priority: 'Normal'
//         }).unwrap();

//         setUploadProgress(prev => ({
//           ...prev,
//           isUploading: false,
//           success: true,
//           progress: 100,
//           uploadedCount: 1
//         }));
//       } else {
//         // Batch upload
//         const result = await uploadBatch({
//           files,
//           folder
//         }).unwrap();

//         setUploadProgress(prev => ({
//           ...prev,
//           isUploading: false,
//           success: true,
//           progress: 100,
//           uploadedCount: result.successful.length
//         }));

//         if (result.errors.length > 0) {
//           setUploadProgress(prev => ({
//             ...prev,
//             error: `${result.errors.length} files failed to upload`
//           }));
//         }
//       }

//       // Clear files and redirect after successful upload
//       setTimeout(() => {
//         setFiles([]);
//         setUploadProgress({
//           isUploading: false,
//           progress: 0,
//           success: false,
//           error: null,
//           uploadedCount: 0,
//           totalCount: 0
//         });
//         navigate('/');
//       }, 2000);

//     } catch (error: any) {
//       setUploadProgress(prev => ({
//         ...prev,
//         isUploading: false,
//         error: error.data?.error || 'Upload failed. Please try again.'
//       }));
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         <h1 className="text-3xl font-bold text-gray-900">Upload Images</h1>
//         <p className="text-gray-600 mt-1">
//           Add new images to your gallery
//         </p>
//       </motion.div>

//       {/* Upload Settings */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//       >
//         <Card className="bg-white/60 backdrop-blur-sm border-white/40">
//           <CardHeader>
//             <CardTitle>Upload Settings</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Destination Folder
//                 </label>
//                 <select
//                   value={folder}
//                   onChange={(e) => setFolder(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
//                 >
//                   <option value="general">General</option>
//                   <option value="portraits">Portraits</option>
//                   <option value="landscapes">Landscapes</option>
//                   <option value="products">Products</option>
//                 </select>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Upload Zone */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2 }}
//       >
//         <Card className="bg-white/60 backdrop-blur-sm border-white/40">
//           <CardContent className="p-6">
//             <UploadZone
//               files={files}
//               onFilesChange={setFiles}
//               maxFiles={10}
//               accept="image/*"
//               maxSize={52428800} // 50MB
//             />
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Upload Progress */}
//       <UploadProgress
//         isUploading={uploadProgress.isUploading}
//         progress={uploadProgress.progress}
//         success={uploadProgress.success}
//         error={uploadProgress.error}
//         uploadedCount={uploadProgress.uploadedCount}
//         totalCount={uploadProgress.totalCount}
//       />

//       {/* Action Buttons */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//         className="flex justify-end space-x-4"
//       >
//         <Button
//           variant="outline"
//           onClick={() => setFiles([])}
//           disabled={files.length === 0 || uploadProgress.isUploading}
//         >
//           Clear All
//         </Button>
//         <Button
//           onClick={handleUpload}
//           disabled={files.length === 0 || uploadProgress.isUploading}
//           className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//         >
//           {uploadProgress.isUploading ? 'Uploading...' : `Upload ${files.length} Image${files.length !== 1 ? 's' : ''}`}
//         </Button>
//       </motion.div>
//     </div>
//   );
// };

// export default Upload;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  useUploadImageMutation,
  useUploadBatchMutation
} from '../store/api/apiSlice';
import UploadZone from '../components/upload/UploadZone';
import UploadProgress from '../components/upload/UploadProgress';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [folder, setFolder] = useState('general');
  const [uploadProgress, setUploadProgress] = useState({
    isUploading: false,
    progress: 0,
    success: false,
    error: null as string | null,
    uploadedCount: 0,
    totalCount: 0
  });

  const [uploadImage] = useUploadImageMutation();
  const [uploadBatch] = useUploadBatchMutation();

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
          priority: 'Normal'
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
          folder
        }).unwrap();

        // Add defensive checks for the result
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

      // Clear files and redirect after successful upload
      setTimeout(() => {
        setFiles([]);
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
      console.error('Upload error:', error); // Add logging to debug
      setUploadProgress(prev => ({
        ...prev,
        isUploading: false,
        error: error.data?.error || error.message || 'Upload failed. Please try again.'
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Upload Images</h1>
        <p className="text-gray-600 mt-1">
          Add new images to your gallery
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
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Folder
                </label>
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                >
                  <option value="general">General</option>
                  <option value="portraits">Portraits</option>
                  <option value="landscapes">Landscapes</option>
                  <option value="products">Products</option>
                </select>
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
          onClick={() => setFiles([])}
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
