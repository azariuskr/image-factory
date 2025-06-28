import React from 'react';
import { 
  Grid, 
  List, 
  Eye, 
  LayoutGrid, 
  CheckSquare, 
  GitCompare as Compare, 
  Menu,
  ChevronLeft
} from 'lucide-react';
import { Button } from '../ui/button';

interface GalleryTopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  totalCount: number;
  folder: string;
  selectedCount: number;
  comparisonMode: boolean;
  comparisonCount: number;
  onToggleComparison: () => void;
  bulkMode: boolean;
  onToggleBulk: () => void;
  thumbnailSize: 'small' | 'medium' | 'large';
  onThumbnailSizeChange: (size: 'small' | 'medium' | 'large') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const GalleryTopBar: React.FC<GalleryTopBarProps> = ({
  sidebarOpen,
  onToggleSidebar,
  totalCount,
  folder,
  selectedCount,
  comparisonMode,
  comparisonCount,
  onToggleComparison,
  bulkMode,
  onToggleBulk,
  thumbnailSize,
  onThumbnailSizeChange,
  viewMode,
  onViewModeChange
}) => {
  const thumbnailSizeOptions = [
    { value: 'small' as const, label: 'Small', icon: LayoutGrid },
    { value: 'medium' as const, label: 'Medium', icon: Grid },
    { value: 'large' as const, label: 'Large', icon: Eye }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleSidebar}
            className="h-10 w-10"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Title and Stats */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
            <p className="text-sm text-gray-600">
              {totalCount} items in {folder} folder
              {selectedCount > 0 && (
                <span className="ml-2 text-blue-600">
                  • {selectedCount} selected
                </span>
              )}
              {comparisonMode && (
                <span className="ml-2 text-purple-600">
                  • Comparison mode ({comparisonCount}/2 selected)
                </span>
              )}
              <span className="ml-2 text-green-600">
                • Click image to preview • Eye icon for metadata
              </span>
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          {/* Mode Toggles */}
          <Button
            variant={comparisonMode ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleComparison}
            className={comparisonMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
          >
            <Compare className="h-4 w-4 mr-1" />
            Compare
          </Button>

          <Button
            variant={bulkMode ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleBulk}
            className={bulkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Bulk
          </Button>

          {/* Thumbnail Size */}
          <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-lg p-1">
            {thumbnailSizeOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={thumbnailSize === value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onThumbnailSizeChange(value)}
                className={thumbnailSize === value ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryTopBar;