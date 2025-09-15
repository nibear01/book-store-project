// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// User API functions
export const userAPI = {
    // Register a new user
    register: async (userData) => {
        const { name, email, password, address } = userData;

        const response = await apiRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password,
                address,
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
        const { email, password } = credentials;

        const response = await apiRequest('/users/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
            }),
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
    updateProfileById: async (userId, userData) => {
        return await apiRequest(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },
};

export default userAPI;
