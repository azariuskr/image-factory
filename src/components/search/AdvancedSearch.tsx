import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Calendar, Tag, Folder, FileType } from 'lucide-react';
import { SearchFilters, MediaType } from '../../types/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onToggle
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !filters.tags?.includes(newTag.trim())) {
      onFiltersChange({
        ...filters,
        tags: [...(filters.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags?.filter(tag => tag !== tagToRemove)
    });
  };

  const mediaTypes = [
    { value: MediaType.Image, label: 'Images' },
    { value: MediaType.Video, label: 'Videos' },
    { value: MediaType.Audio, label: 'Audio' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date' },
    { value: 'size', label: 'Size' },
    { value: 'type', label: 'Type' }
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar with Toggle */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by filename, ID, or content..."
            value={filters.query || ''}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        <Button
          variant={isOpen ? 'default' : 'outline'}
          onClick={onToggle}
          className={isOpen ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button onClick={onSearch} className="bg-gradient-to-r from-blue-600 to-purple-600">
          Search
        </Button>
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardContent className="p-6 space-y-6">
              {/* Media Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileType className="h-4 w-4 inline mr-1" />
                  Media Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {mediaTypes.map(type => (
                    <Button
                      key={type.value}
                      size="sm"
                      variant={filters.mediaType === type.value ? 'default' : 'outline'}
                      onClick={() => onFiltersChange({
                        ...filters,
                        mediaType: filters.mediaType === type.value ? undefined : type.value
                      })}
                      className={filters.mediaType === type.value ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tag filter"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                    <Button onClick={handleAddTag} disabled={!newTag.trim()} size="sm">
                      Add
                    </Button>
                  </div>
                  
                  {filters.tags && filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filters.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
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

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        dateRange: {
                          ...filters.dateRange,
                          start: e.target.value,
                          end: filters.dateRange?.end || ''
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        dateRange: {
                          start: filters.dateRange?.start || '',
                          end: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                  </div>
                </div>
              </div>

              {/* File Size Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Size (MB)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.sizeRange?.min || ''}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        sizeRange: {
                          ...filters.sizeRange,
                          min: Number(e.target.value),
                          max: filters.sizeRange?.max || 0
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.sizeRange?.max || ''}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        sizeRange: {
                          min: filters.sizeRange?.min || 0,
                          max: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={filters.sortBy || 'date'}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      sortBy: e.target.value as any
                    })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.sortOrder || 'desc'}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      sortOrder: e.target.value as 'asc' | 'desc'
                    })}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={onClear}>
                  Clear Filters
                </Button>
                <Button onClick={onSearch} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedSearch;