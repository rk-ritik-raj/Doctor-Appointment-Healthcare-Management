import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on boot and load user
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          
          // Re-fetch profile to keep data fresh
          const endpoint = JSON.parse(storedUser).role === 'doctor' 
            ? '/doctors/profile' 
            : '/patients/profile';
            
          const res = await API.get(endpoint);
          const freshUser = res.data.data.user;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Error reloading user profile:', error);
          // Token might have expired or server offline
          if (error.response && error.response.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Log in user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
      
      toast.success('Logged in successfully!');
      return receivedUser;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register user (Patient or Doctor)
  const register = async (name, email, password, role, doctorDetails) => {
    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role,
        doctorDetails: role === 'doctor' ? doctorDetails : undefined,
      };

      const res = await API.post('/auth/register', payload);
      toast.success('Registration successful! Please check your email to verify your account.');
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Log out user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Check email verification link
  const verifyEmail = async (token) => {
    try {
      const res = await API.post('/auth/verify-email', { token });
      toast.success(res.data.message || 'Email verified successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        verifyEmail,
        setUser,
      }}
    >
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
