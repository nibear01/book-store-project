// Shared backend URLs — use VITE_BACKEND_URL in production, fallback to localhost in dev
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const API_BASE_URL = `${BACKEND_URL}/api`;

export default API_BASE_URL;
