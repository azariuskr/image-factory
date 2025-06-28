import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FolderPlus,
  Trash2,
  Edit,
  Image,
  Calendar,
  HardDrive,
  MoreHorizontal
} from 'lucide-react';
import { useGetFoldersQuery, useCreateFolderMutation, useDeleteFolderMutation } from '../../store/api/apiSlice';
import { formatFileSize, formatDate } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface FolderManagerProps {
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  className?: string;
}

const FolderManager: React.FC<FolderManagerProps> = ({
  selectedFolder,
  onFolderSelect,
  className = ''
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  const { data: foldersData, isLoading, error, refetch } = useGetFoldersQuery();
  const [createFolder, { isLoading: isCreating }] = useCreateFolderMutation();
  const [deleteFolder, { isLoading: isDeleting }] = useDeleteFolderMutation();

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder({
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || undefined
      }).unwrap();

      setNewFolderName('');
      setNewFolderDescription('');
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    try {
      await deleteFolder(folderName).unwrap();
      setFolderToDelete(null);
      
      // If the deleted folder was selected, switch to general
      if (selectedFolder === folderName) {
        onFolderSelect('general');
      }
      
      refetch();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const folders = foldersData?.folders || [];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Folders</h3>
        <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">Failed to load folders</p>
            <Button size="sm" onClick={() => refetch()} className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Default general folder */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                selectedFolder === 'general'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent'
                  : 'bg-white/60 backdrop-blur-sm hover:bg-white/80 border-white/40'
              }`}
              onClick={() => onFolderSelect('general')}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Folder className="h-5 w-5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">General</h4>
                    <p className={`text-sm ${
                      selectedFolder === 'general' ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      Default folder
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Custom folders */}
          <AnimatePresence>
            {folders.map((folder) => (
              <motion.div
                key={folder.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 group ${
                    selectedFolder === folder.name
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent'
                      : 'bg-white/60 backdrop-blur-sm hover:bg-white/80 border-white/40'
                  }`}
                  onClick={() => onFolderSelect(folder.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Folder className="h-5 w-5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{folder.name}</h4>
                        <div className={`flex items-center space-x-3 text-xs ${
                          selectedFolder === folder.name ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          <div className="flex items-center space-x-1">
                            <Image className="h-3 w-3" />
                            <span>{folder.imageCount} images</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <HardDrive className="h-3 w-3" />
                            <span>{formatFileSize(folder.totalSize)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {folder.name !== 'general' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderToDelete(folder.name);
                          }}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                            selectedFolder === folder.name
                              ? 'text-white hover:bg-white/20'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Folder Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your images
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Name *
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Enter folder description"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || isCreating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isCreating ? 'Creating...' : 'Create Folder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={folderToDelete !== null} onOpenChange={() => setFolderToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the folder "{folderToDelete}"? 
              This action cannot be undone and will delete all images in this folder.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setFolderToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => folderToDelete && handleDeleteFolder(folderToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Folder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderManager;