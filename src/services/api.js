// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const isMockMode = () => USE_MOCK;

export const fetchApi = async (endpoint, options = {}) => {
  if (USE_MOCK) {
    console.warn('API is running in mock mode. Fetch intercepted.');
    return null;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const get = (endpoint) => fetchApi(endpoint, { method: 'GET' });
export const post = (endpoint, body) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) });
