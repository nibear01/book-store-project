/**
 * Image URL Helper - Centralized image URL construction
 * Handles all formats of image paths from backend
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Constructs proper image URL from various path formats
 * @param {string} imagePath - Image path from backend (can be relative or absolute)
 * @param {string} baseUrl - Optional base URL (defaults to API_BASE)
 * @returns {string|null} Full image URL or null if invalid
 */
export const buildImageUrl = (imagePath, baseUrl = API_BASE) => {
  // Handle null/undefined
  if (!imagePath || typeof imagePath !== "string") return null;

  const path = String(imagePath).trim();
  if (!path) return null;

  // Already a full URL (http/https)
  if (/^https?:\/\//i.test(path)) return path;

  // Ensure baseUrl doesn't have trailing slash
  const cleanBase = String(baseUrl).replace(/\/$/, "");

  // Path starts with / - prepend base directly
  if (path.startsWith("/")) return `${cleanBase}${path}`;

  // No leading slash - prepend /uploads/ if not already there
  if (!path.startsWith("uploads/")) {
    return `${cleanBase}/uploads/${path}`;
  }

  // Path like "uploads/..." - prepend base with /
  return `${cleanBase}/${path}`;
};

/**
 * Get first cover image from book object
 * @param {Object} book - Book object
 * @returns {string|null} First cover image path or null
 */
export const getFirstCoverImage = (book) => {
  if (!book) return null;

  const images = Array.isArray(book.cover_image) ? book.cover_image : [];
  return images.length > 0 && images[0] ? String(images[0]).trim() : null;
};

/**
 * Get first cover image URL from book object
 * @param {Object} book - Book object
 * @param {string} baseUrl - Optional base URL
 * @returns {string|null} Full cover image URL or null
 */
export const getBookCoverUrl = (book, baseUrl = API_BASE) => {
  const coverPath = getFirstCoverImage(book);
  return coverPath ? buildImageUrl(coverPath, baseUrl) : null;
};

/**
 * Get all book cover URLs as array
 * @param {Object} book - Book object
 * @param {string} baseUrl - Optional base URL
 * @returns {Array<string>} Array of cover image URLs
 */
export const getBookCoverUrls = (book, baseUrl = API_BASE) => {
  if (!book || !Array.isArray(book.cover_image)) return [];

  return book.cover_image
    .map((path) => buildImageUrl(path, baseUrl))
    .filter((url) => url !== null);
};

/**
 * Safely normalize book genre to array format
 * @param {string|Array} genre - Genre from book object
 * @returns {Array<string>} Genre as array
 */
export const normalizeGenre = (genre) => {
  if (!genre) return [];

  if (Array.isArray(genre)) {
    return genre.map((g) => String(g).trim()).filter(Boolean);
  }

  if (typeof genre === "string") {
    // Split by comma or pipe, handle edge cases
    const separator = genre.includes(",") ? "," : "|";
    return genre
      .split(separator)
      .map((g) => String(g).trim())
      .filter(Boolean);
  }

  return [];
};

export default buildImageUrl;
