// Utility functions for handling image URLs
import { mockImageService } from '../services/mockImageService';

/**
 * Get a properly formatted image URL that works regardless of backend availability
 * @param {string} imagePath - The image path or URL
 * @param {string} baseUrl - The base URL to prepend (optional)
 * @returns {string} - A working image URL
 */
export const getImageUrl = (imagePath, baseUrl = '') => {
  if (!imagePath) return '/book-placeholder.jpg';
  
  // If it's already a full URL (not localhost:5000), return it
  if (imagePath.startsWith('http') && !imagePath.includes('localhost:5000')) {
    return imagePath;
  }
  
  // If it's a localhost:5000 URL or a path that needs the baseUrl
  if (imagePath.includes('localhost:5000')) {
    return mockImageService.getImageUrl(imagePath);
  }
  
  // If it's a relative path that needs the baseUrl
  const fullPath = `${baseUrl}${imagePath}`;
  
  // If the full path contains localhost:5000, use mock service
  if (fullPath.includes('localhost:5000')) {
    return mockImageService.getImageUrl(fullPath);
  }
  
  return fullPath;
};