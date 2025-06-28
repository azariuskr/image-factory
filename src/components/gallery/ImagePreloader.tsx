import { useEffect } from 'react';
import { GalleryImage } from '../../types/api';
import { useImageCache } from '../../hooks/useImageCache';

interface ImagePreloaderProps {
  images: GalleryImage[];
  currentIndex?: number;
  preloadCount?: number;
}

const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  images,
  currentIndex = 0,
  preloadCount = 5
}) => {
  const { preloadImage } = useImageCache();

  useEffect(() => {
    const preloadImages = async () => {
      // Preload images around the current index
      const startIndex = Math.max(0, currentIndex - Math.floor(preloadCount / 2));
      const endIndex = Math.min(images.length - 1, currentIndex + Math.floor(preloadCount / 2));

      const preloadPromises = [];
      
      for (let i = startIndex; i <= endIndex; i++) {
        if (images[i]?.url) {
          preloadPromises.push(preloadImage(images[i].url));
        }
        if (images[i]?.thumbnailUrl && images[i].thumbnailUrl !== images[i].url) {
          preloadPromises.push(preloadImage(images[i].thumbnailUrl));
        }
      }

      try {
        await Promise.allSettled(preloadPromises);
      } catch (error) {
        console.warn('Some images failed to preload:', error);
      }
    };

    if (images.length > 0) {
      preloadImages();
    }
  }, [images, currentIndex, preloadCount, preloadImage]);

  // This component doesn't render anything
  return null;
};

export default ImagePreloader;