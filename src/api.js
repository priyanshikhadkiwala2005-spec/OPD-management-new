// =============================================
// Central API configuration
// Node.js + Express backend on port 5000
// =============================================

export const API = 'http://localhost:5000/api';

// Get token from localStorage
export const getToken = () => localStorage.getItem('opd_token');

// Save token
export const saveToken = (token) => localStorage.setItem('opd_token', token);

// Remove token
export const removeToken = () => localStorage.removeItem('opd_token');

// Default headers with JWT token
export const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

// API call helper
export const apiCall = async (url, options = {}) => {
  const response = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  return response.json();
};
