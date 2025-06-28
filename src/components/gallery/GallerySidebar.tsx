import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Folder, 
  X
} from 'lucide-react';
import { SearchFilters } from '../../types/api';
import { Button } from '../ui/button';

interface GallerySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  searchFilters: SearchFilters;
  onSearchFiltersChange: (filters: SearchFilters) => void;
  folder: string;
  onFolderChange: (folder: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

const GallerySidebar: React.FC<GallerySidebarProps> = ({
  isOpen,
  onClose,
  searchFilters,
  onSearchFiltersChange,
  folder,
  onFolderChange,
  onSearch,
  onClearFilters
}) => {
  const commonFolders = ['general', 'portraits', 'landscapes', 'products', 'events', 'nature'];

  const handleFolderInputChange = (newFolder: string) => {
    onFolderChange(newFolder || 'general');
  };

  const handleFolderInputKeyPress = (e: React.KeyboardEvent, newFolder: string) => {
    if (e.key === 'Enter') {
      onFolderChange(newFolder);
    }
  };

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-80 bg-white/80 backdrop-blur-md shadow-xl border-r border-white/40 flex flex-col"
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-white/40">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Search */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Search className="h-4 w-4 inline mr-2" />
            Search Images
          </label>
          <input
            type="text"
            placeholder="Search by filename, ID, or tags..."
            value={searchFilters.query || ''}
            onChange={(e) => onSearchFiltersChange({ ...searchFilters, query: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>

        {/* Folder Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Folder className="h-4 w-4 inline mr-2" />
            Current Folder
          </label>
          <input
            type="text"
            value={folder}
            onChange={(e) => handleFolderInputChange(e.target.value)}
            onKeyPress={(e) => handleFolderInputKeyPress(e, folder)}
            placeholder="Enter folder name..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            list="folder-suggestions"
          />
          <datalist id="folder-suggestions">
            {commonFolders.map(folderName => (
              <option key={folderName} value={folderName} />
            ))}
          </datalist>
          
          {/* Quick folder buttons */}
          <div className="grid grid-cols-2 gap-2">
            {commonFolders.map(folderName => (
              <Button
                key={folderName}
                size="sm"
                variant={folder === folderName ? 'default' : 'outline'}
                onClick={() => onFolderChange(folderName)}
                className={`text-xs ${folder === folderName ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
              >
                {folderName}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Filter className="h-4 w-4 inline mr-2" />
            Sort & Order
          </label>
          <div className="space-y-2">
            <select
              value={searchFilters.sortBy || 'date'}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, sortBy: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={searchFilters.sortOrder === 'asc' ? 'default' : 'outline'}
                onClick={() => onSearchFiltersChange({ ...searchFilters, sortOrder: 'asc' })}
                className={searchFilters.sortOrder === 'asc' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                Ascending
              </Button>
              <Button
                size="sm"
                variant={searchFilters.sortOrder === 'desc' ? 'default' : 'outline'}
                onClick={() => onSearchFiltersChange({ ...searchFilters, sortOrder: 'desc' })}
                className={searchFilters.sortOrder === 'desc' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                Descending
              </Button>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={searchFilters.dateRange?.start || ''}
                onChange={(e) => onSearchFiltersChange({
                  ...searchFilters,
                  dateRange: {
                    ...searchFilters.dateRange,
                    start: e.target.value,
                    end: searchFilters.dateRange?.end || ''
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={searchFilters.dateRange?.end || ''}
                onChange={(e) => onSearchFiltersChange({
                  ...searchFilters,
                  dateRange: {
                    start: searchFilters.dateRange?.start || '',
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
                value={searchFilters.sizeRange?.min || ''}
                onChange={(e) => onSearchFiltersChange({
                  ...searchFilters,
                  sizeRange: {
                    ...searchFilters.sizeRange,
                    min: Number(e.target.value),
                    max: searchFilters.sizeRange?.max || 0
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
                value={searchFilters.sizeRange?.max || ''}
                onChange={(e) => onSearchFiltersChange({
                  ...searchFilters,
                  sizeRange: {
                    min: searchFilters.sizeRange?.min || 0,
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
              onClick={() => onSearchFiltersChange({
                ...searchFilters,
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
              onClick={() => onSearchFiltersChange({
                ...searchFilters,
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
              onClick={() => onSearchFiltersChange({
                ...searchFilters,
                sizeRange: { min: 0, max: 5 }
              })}
              className="w-full justify-start"
            >
              Small files (&lt; 5MB)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSearchFiltersChange({
                ...searchFilters,
                sizeRange: { min: 10, max: 1000 }
              })}
              className="w-full justify-start"
            >
              Large files (&gt; 10MB)
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Button
            onClick={onSearch}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GallerySidebar;