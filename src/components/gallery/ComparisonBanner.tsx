import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { GalleryImage } from '../../types/api';

interface ComparisonBannerProps {
  comparisonImages: GalleryImage[];
  onClearComparison: () => void;
  onExitComparison: () => void;
}

const ComparisonBanner: React.FC<ComparisonBannerProps> = ({
  comparisonImages,
  onClearComparison,
  onExitComparison
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-purple-50 border-b border-purple-200 p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-purple-800">Comparison Mode Active</h3>
          <p className="text-sm text-purple-600 mt-1">
            Select 2 images to compare them side by side. {comparisonImages.length}/2 selected.
          </p>
        </div>
        <div className="flex space-x-2">
          {comparisonImages.length === 2 && (
            <Button
              size="sm"
              onClick={onClearComparison}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              View Comparison
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onExitComparison}
          >
            Exit Comparison
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonBanner;