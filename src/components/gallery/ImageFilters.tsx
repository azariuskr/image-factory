import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, FileType, Tag, Folder, SortAsc, SortDesc } from 'lucide-react';
import { SearchFilters, MediaType } from '../../types/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface ImageFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApply: () => void;
  onClear: () => void;
  isVisible: boolean;
  onToggle: () => void;
}

const ImageFilters: React.FC<ImageFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  isVisible,
  onToggle
}) => {
  const sortOptions = [
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'name', label: 'Name', icon: FileType },
    { value: 'size', label: 'Size', icon: FileType },
    { value: 'type', label: 'Type', icon: FileType }
  ];

  const mediaTypes = [
    { value: MediaType.Image, label: 'Images' },
    { value: MediaType.Video, label: 'Videos' },
    { value: MediaType.Audio, label: 'Audio' }
  ];

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant={isVisible ? 'default' : 'outline'}
          onClick={onToggle}
          className={isVisible ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
        
        {isVisible && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear All
            </Button>
            <Button size="sm" onClick={onApply} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Apply Filters
            </Button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Sort Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <SortAsc className="h-4 w-4 inline mr-1" />
                    Sort By
                  </label>
                  <div className="space-y-2">
                    <select
                      value={filters.sortBy || 'date'}
                      onChange={(e) => onFiltersChange({
                        ...filters,
                        sortBy: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
                        onClick={() => onFiltersChange({
                          ...filters,
                          sortOrder: 'asc'
                        })}
                        className={filters.sortOrder === 'asc' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                      >
                        <SortAsc className="h-3 w-3 mr-1" />
                        Ascending
                      </Button>
                      <Button
                        size="sm"
                        variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
                        onClick={() => onFiltersChange({
                          ...filters,
                          sortOrder: 'desc'
                        })}
                        className={filters.sortOrder === 'desc' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                      >
                        <SortDesc className="h-3 w-3 mr-1" />
                        Descending
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Media Type Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <FileType className="h-4 w-4 inline mr-1" />
                    Media Type
                  </label>
                  <div className="space-y-2">
                    {mediaTypes.map(type => (
                      <label key={type.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="mediaType"
                          value={type.value}
                          checked={filters.mediaType === type.value}
                          onChange={(e) => onFiltersChange({
                            ...filters,
                            mediaType: e.target.checked ? type.value : undefined
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="mediaType"
                        checked={!filters.mediaType}
                        onChange={() => onFiltersChange({
                          ...filters,
                          mediaType: undefined
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All Types</span>
                    </label>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date Range
                  </label>
                  <div className="space-y-2">
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
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    File Size (MB)
                  </label>
                  <div className="space-y-2">
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

                {/* Quick Filters */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Quick Filters
                  </label>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFiltersChange({
                        ...filters,
                        dateRange: {
                          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          end: new Date().toISOString().split('T')[0]
                        }
                      })}
                      className="w-full justify-start"
                    >
                      Last 7 days
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFiltersChange({
                        ...filters,
                        dateRange: {
                          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          end: new Date().toISOString().split('T')[0]
                        }
                      })}
                      className="w-full justify-start"
                    >
                      Last 30 days
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFiltersChange({
                        ...filters,
                        sizeRange: { min: 0, max: 5 }
                      })}
                      className="w-full justify-start"
                    >
                      Small files (&lt; 5MB)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFiltersChange({
                        ...filters,
                        sizeRange: { min: 10, max: 1000 }
                      })}
                      className="w-full justify-start"
                    >
                      Large files (&gt; 10MB)
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ImageFilters;