import axios from 'axios';
import { getStoredTokens } from './auth';

// Base URL for the API
const API_BASE_URL = 'https://ai-finance-webapp.onrender.com'; // Update this with your server URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const tokens = await getStoredTokens();
      
      if (tokens && tokens.idToken) {
        config.headers.Authorization = `Bearer ${tokens.idToken}`;
        console.log('Added auth token to request');
      } else {
        console.log('No auth token found');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default api;
