// Shared API base URL — use VITE_BACKEND_URL in production, fallback to localhost in dev
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

export default API_BASE_URL;
