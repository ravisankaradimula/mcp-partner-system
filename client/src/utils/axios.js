import axios from 'axios';

// Create a new axios instance with default config
const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Log the token for debugging
    console.log('Token for request:', token);
    
    // If token exists, add it to the headers
    if (token) {
      // Make sure we're using the correct format
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added token to request headers:', config.headers.Authorization);
    } else {
      console.log('No token found for request:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.config?.url, error.response?.status);
    console.error('Error details:', error.response?.data);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log('Unauthorized access detected');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login page');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance; 