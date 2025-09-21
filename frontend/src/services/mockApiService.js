// Mock API service to handle backend API requests when backend is unavailable
import { mockBookService } from './mockBookService';

/**
 * Utility to handle API requests when backend is unavailable
 * Intercepts axios requests and provides mock data responses
 */
export const mockApiService = {
  // Setup axios interceptors to handle connection refused errors
  setupInterceptors: (axios) => {
    // Response interceptor
    axios.interceptors.response.use(
      (response) => response, // Return successful responses as-is
      async (error) => {
        // Only handle connection refused errors
        if (error.message && (
          error.message.includes('Network Error') ||
          error.message.includes('ECONNREFUSED') ||
          error.code === 'ERR_NETWORK'
        )) {
          console.log('Backend API connection error, using mock data');
          
          // Extract the request URL and method
          const { url, method, params } = error.config;
          
          // Handle different API endpoints
          if (url.includes('/api/books')) {
            // Extract the endpoint path
            const path = url.split('/api/books')[1] || '/';
            
            // Handle different book endpoints
            if (path === '/' || path === '') {
              return { data: await mockBookService.getBooks(params?.limit) };
            } else if (path.includes('/featured')) {
              return { data: await mockBookService.getFeaturedBooks(params?.limit) };
            } else if (path.includes('/trending')) {
              return { data: await mockBookService.getTrendingBooks(params?.limit) };
            } else if (path.includes('/latest')) {
              return { data: await mockBookService.getLatestBooks(params?.limit) };
            } else if (path.includes('/on-sale')) {
              return { data: await mockBookService.getOnSaleBooks(params?.limit) };
            } else if (path.includes('/deals')) {
              return { data: await mockBookService.getDealsOfWeek(params?.limit) };
            } else if (path.includes('/most-viewed')) {
              return { data: await mockBookService.getBooks(params?.limit) };
            } else {
              // Handle individual book by slug
              const slug = path.substring(1); // Remove leading slash
              return { data: { data: await mockBookService.getBookBySlug(slug) } };
            }
          }
          
          // For other API endpoints, return a generic error response
          return Promise.reject({
            ...error,
            message: 'Backend unavailable and no mock data available for this endpoint'
          });
        }
        
        // For other errors, pass through
        return Promise.reject(error);
      }
    );
    
    return axios;
  }
};