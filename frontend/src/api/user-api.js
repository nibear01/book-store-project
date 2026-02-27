// Base API URL
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    // Detect FormData
    const isFormData = options.body instanceof FormData;

    // Build headers without forcing JSON for FormData
    const headers = {
        ...(options.headers || {}),
    };
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Prepare body
    let body = options.body;
    if (!isFormData && body && typeof body !== 'string') {
        body = JSON.stringify(body);
    }

    const config = {
        method: options.method || 'GET',
        headers,
        body,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        if (!response.ok) {
            // Only clear token on 401 if it's a token-related auth error
            // Don't clear on permission errors (403) or other errors
            if (response.status === 401 && 
                (data.message?.toLowerCase().includes('token') || 
                 data.message?.toLowerCase().includes('not authorized') ||
                 data.message?.toLowerCase().includes('authentication required'))) {
                console.warn('Token invalid or expired, clearing auth state');
                localStorage.removeItem('token');
                localStorage.removeItem('activeRole');
            }
            throw new Error(data.message || 'Something went wrong');
        }
        return data;
    } catch (error) {
        // Only log non-auth errors to avoid console spam
        if (!error.message?.includes('token') && !error.message?.toLowerCase().includes('authorized')) {
            console.error('API Error:', error);
        }
        throw error;
    }
};

// User API functions
export const userAPI = {
    // Register a new user
    register: async (userData) => {
        const { name, email, password, address, phone } = userData;

        const response = await apiRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password,
                address,
                phone,
            }),
        });

        // Store token in localStorage
        if (response.token) {
            localStorage.setItem('token', response.token);
        }

        return response;
    },

    // Login user
    login: async (credentials) => {
        // Support both email and phone login
        const { email, phone, password } = credentials;
        const isPhoneLogin = !!phone && !email;

        const response = await apiRequest(isPhoneLogin ? '/users/login-phone' : '/users/login', {
            method: 'POST',
            body: JSON.stringify(
                isPhoneLogin
                    ? { phone, password }
                    : { email, password }
            ),
        });

        // Store token in localStorage
        if (response.token) {
            localStorage.setItem('token', response.token);
        }

        return response;
    },

    // Get current user profile
    getMe: async () => {
        return await apiRequest('/users/me');
    },

    // Logout user (remove token from localStorage)
    logout: () => {
        localStorage.removeItem('token');
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Get stored token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Update user profile by ID (aligns with backend PUT /users/:id)
    updateProfileById: async (userId, userData, options = {}) => {
        // userData can be a plain object or FormData
        return await apiRequest(`/users/${userId}`, {
            method: 'PUT',
            body: userData,
            headers: options.headers, // optional passthrough
        });
    },

    // Forgot / Reset password
    forgotPassword: async (email) => {
        return await apiRequest('/users/forgot-password', {
            method: 'POST',
            body: { email },
        });
    },
    resetPassword: async ({ email, token, password }) => {
        return await apiRequest('/users/reset-password', {
            method: 'POST',
            body: { email, token, password },
        });
    },
};

export default userAPI;
