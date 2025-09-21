// Mock image service to handle image asset requests when backend is unavailable

// Map of backend image paths to local public assets
const imageMap = {
  '/assets/images/book-cover.jpg': '/book-cover-placeholder.jpg',
  '/assets/images/js-book.jpg': '/js-book-placeholder.jpg',
  // Add full URLs for direct matching
  'http://localhost:5000/assets/images/book-cover.jpg': '/book-cover-placeholder.jpg',
  'http://localhost:5000/assets/images/js-book.jpg': '/js-book-placeholder.jpg'
};

/**
 * Utility to handle image URLs when backend is unavailable
 * @param {string} backendImagePath - The original image path that may reference localhost:5000
 * @param {string} baseUrl - Optional base URL that might be prepended to the path
 * @returns {string} A valid image URL that works regardless of backend availability
 */
export const mockImageService = {
  // Get image URL that works regardless of backend availability
  getImageUrl: (backendImagePath, baseUrl = '') => {
    // Handle null/undefined case
    if (!backendImagePath) return '/book-placeholder.jpg';
    
    // If it's already a valid path that doesn't reference localhost, return as is
    if (!backendImagePath.includes('localhost:5000') && 
        !backendImagePath.startsWith('http://localhost:5000') && 
        !baseUrl?.includes('localhost:5000')) {
      return backendImagePath;
    }
    
    try {
      // Extract the path part from the URL
      let pathPart = backendImagePath;
      
      // Handle case where baseUrl + backendImagePath forms the full URL
      if (baseUrl && baseUrl.includes('localhost:5000') && !backendImagePath.includes('localhost:5000')) {
        pathPart = backendImagePath;
      }
      // Handle direct localhost URLs
      else if (backendImagePath.includes('localhost:5000')) {
        const fullUrl = backendImagePath.startsWith('http') ? 
          backendImagePath : 
          `http:${backendImagePath}`;
        pathPart = new URL(fullUrl).pathname;
      }
      
      // Return the mapped local image or a default placeholder
      return imageMap[pathPart] || '/book-placeholder.jpg';
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '/book-placeholder.jpg';
    }
  }
};