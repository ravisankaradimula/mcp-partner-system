import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Fetching user profile...');
      const token = localStorage.getItem('token');
      console.log('Current token:', token);
      
      // Manually set the token for this request
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Profile response:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error.response?.data || error.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Attempting login with:', email);
      
      // Make a direct fetch request to ensure we're not using the axios instance
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { token, user } = data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store the token
      console.log('Storing token:', token);
      localStorage.setItem('token', token);
      
      // Set the user
      setUser(user);
      
      // Manually set the token for the profile request
      const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to verify token');
      }
      
      const profileData = await profileResponse.json();
      console.log('Profile verification successful:', profileData);
      
      return true;
    } catch (error) {
      console.error('Login error:', error.message);
      setError(error.message || 'Login failed. Please check your credentials.');
      localStorage.removeItem('token');
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      setUser(user);
      
      // Verify the token works
      await fetchUser();
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      localStorage.removeItem('token');
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 