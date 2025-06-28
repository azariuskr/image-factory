import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Square,
  Trash2,
  FolderOpen,
  Copy,
  Tag,
  Settings,
  X,
  AlertTriangle
} from 'lucide-react';
import { GalleryImage, BulkOperation } from '../../types/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';

interface BulkOperationsProps {
  images: GalleryImage[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkOperation: (operation: BulkOperation) => Promise<void>;
  isVisible: boolean;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  images,
  selectedIds,
  onSelectionChange,
  onBulkOperation,
  isVisible
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<BulkOperation | null>(null);
  const [targetFolder, setTargetFolder] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const isAllSelected = selectedIds.length === images.length && images.length > 0;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < images.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(images.map(img => img.id));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newTags.includes(newTag.trim())) {
      setNewTags([...newTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags(newTags.filter(tag => tag !== tagToRemove));
  };

  const handleBulkOperation = async (type: BulkOperation['type'], parameters?: Record<string, any>) => {
    const operation: BulkOperation = {
      type,
      itemIds: selectedIds,
      parameters
    };

    if (type === 'delete') {
      setPendingOperation(operation);
      setShowConfirmDialog(true);
    } else {
      await onBulkOperation(operation);
      onSelectionChange([]);
    }
  };

  const confirmOperation = async () => {
    if (pendingOperation) {
      await onBulkOperation(pendingOperation);
      onSelectionChange([]);
      setShowConfirmDialog(false);
      setPendingOperation(null);
    }
  };

  if (!isVisible || selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-white/40 min-w-[600px]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center space-x-2"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : isPartiallySelected ? (
                      <div className="h-4 w-4 border-2 border-blue-600 bg-blue-600/50 rounded-sm" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    <span>{selectedIds.length} selected</span>
                  </Button>

                  <div className="h-6 w-px bg-gray-300" />

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const folder = prompt('Enter target folder:');
                        if (folder) {
                          handleBulkOperation('move', { targetFolder: folder });
                        }
                      }}
                      className="flex items-center space-x-1"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span>Move</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const folder = prompt('Enter target folder:');
                        if (folder) {
                          handleBulkOperation('copy', { targetFolder: folder });
                        }
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const tags = prompt('Enter tags (comma-separated):');
                        if (tags) {
                          const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
                          handleBulkOperation('tag', { tags: tagList });
                        }
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Tag className="h-4 w-4" />
                      <span>Tag</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkOperation('delete')}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectionChange([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Confirm Bulk Operation</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {pendingOperation?.type} {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''}?
            {pendingOperation?.type === 'delete' && (
              <span className="block mt-2 text-red-600 font-medium">
                This action cannot be undone.
              </span>
            )}
          </DialogDescription>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingOperation(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmOperation}
            >
              Confirm {pendingOperation?.type}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkOperations;