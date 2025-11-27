const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://192.168.0.104:5000'}/api`;

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// 🔹 API function to send contact message
export const contactAPI = {
  sendMessage: (payload) =>
    request('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
