import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.log('Token used for profile fetch:', token);
      
      const response = await api.get('/auth/profile');
      console.log('User profile received:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error.response?.data || error.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      console.log('Sending registration request:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      
      const { token, user } = response.data;
      if (token && user) {
        localStorage.setItem('token', token);
        setUser(user);
        return { user, token };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to create account. Please try again.');
      }
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      const response = await api.post('/auth/login', {
        email,
        password
      });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      if (!token || !user) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      console.log('Setting token:', token);
      localStorage.setItem('token', token);
      console.log('Token set in localStorage:', localStorage.getItem('token'));
      
      setUser(user);
      console.log('User state set:', user);
      
      // Verify the token works by making a test request
      console.log('Verifying token with profile request...');
      const profileResponse = await api.get('/auth/profile');
      console.log('Profile verification successful:', profileResponse.data);
      
      return user;
    } catch (error) {
      console.error('Login error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      localStorage.removeItem('token');
      setUser(null);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 