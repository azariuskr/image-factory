import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, X, Save } from 'lucide-react';
import { GalleryImage } from '../../types/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface ImageTagsProps {
  image: GalleryImage;
  onUpdateTags: (imageId: string, tags: string[]) => void;
}

const ImageTags: React.FC<ImageTagsProps> = ({ image, onUpdateTags }) => {
  const [tags, setTags] = useState<string[]>(image.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const handleSave = () => {
    onUpdateTags(image.id, tags);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTags(image.tags || []);
    setNewTag('');
    setIsEditing(false);
  };

  const commonTags = [
    'portrait', 'landscape', 'nature', 'urban', 'architecture',
    'product', 'event', 'wedding', 'travel', 'macro',
    'black-white', 'color', 'vintage', 'modern', 'artistic'
  ];

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-white/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-700">Tags</span>
          </div>
          
          {!isEditing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Display Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              {tag}
              {isEditing && (
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </motion.span>
          ))}
          
          {tags.length === 0 && (
            <span className="text-gray-500 text-sm">No tags added</span>
          )}
        </div>

        {/* Add New Tag */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                list="common-tags"
              />
              <datalist id="common-tags">
                {commonTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              <Button
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Common Tags */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Common tags:</p>
              <div className="flex flex-wrap gap-1">
                {commonTags
                  .filter(tag => !tags.includes(tag))
                  .slice(0, 8)
                  .map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const updatedTags = [...tags, tag];
                        setTags(updatedTags);
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageTags;