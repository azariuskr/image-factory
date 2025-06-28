import { useState, useEffect, useCallback } from 'react';

interface CacheEntry {
  url: string;
  timestamp: number;
  blob?: Blob;
}

class ImageCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100; // Maximum number of cached images
  private maxAge = 30 * 60 * 1000; // 30 minutes in milliseconds

  async get(url: string): Promise<string | null> {
    const entry = this.cache.get(url);
    
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(url);
      return null;
    }

    // If we have a blob, create object URL
    if (entry.blob) {
      return URL.createObjectURL(entry.blob);
    }

    return entry.url;
  }

  async set(url: string, blob?: Blob): Promise<void> {
    // Clean up old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(url, {
      url,
      timestamp: Date.now(),
      blob
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const imageCache = new ImageCache();

export function useImageCache() {
  const [cachedImages, setCachedImages] = useState<Map<string, string>>(new Map());

  const getCachedImage = useCallback(async (url: string): Promise<string> => {
    // Check if we already have it in React state
    const cached = cachedImages.get(url);
    if (cached) return cached;

    // Check the cache
    const cachedUrl = await imageCache.get(url);
    if (cachedUrl) {
      setCachedImages(prev => new Map(prev).set(url, cachedUrl));
      return cachedUrl;
    }

    // If not cached, fetch and cache it
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      await imageCache.set(url, blob);
      setCachedImages(prev => new Map(prev).set(url, objectUrl));
      
      return objectUrl;
    } catch (error) {
      console.warn('Failed to cache image:', url, error);
      return url; // Fallback to original URL
    }
  }, [cachedImages]);

  const preloadImage = useCallback(async (url: string): Promise<void> => {
    try {
      await getCachedImage(url);
    } catch (error) {
      console.warn('Failed to preload image:', url, error);
    }
  }, [getCachedImage]);

  const clearCache = useCallback(() => {
    imageCache.clear();
    setCachedImages(new Map());
  }, []);

  return {
    getCachedImage,
    preloadImage,
    clearCache,
    cacheSize: imageCache.size()
  };
}