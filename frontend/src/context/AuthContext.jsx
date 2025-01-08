import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
      // Optionally fetch user profile here
      auth.getProfile()
        .then(response => {
          setUser(prevUser => ({
            ...prevUser,
            ...response.data.data.user
          }));
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          if (error.response?.status === 401) {
            logout();
          }
        });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await auth.login(credentials);
      const { token } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser({ token });
      
      // Fetch user profile after login
      const profileResponse = await auth.getProfile();
      setUser(prevUser => ({
        ...prevUser,
        ...profileResponse.data.data.user
      }));
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await auth.signup(userData);
      const { token } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser({ token });
      
      // Fetch user profile after signup
      const profileResponse = await auth.getProfile();
      setUser(prevUser => ({
        ...prevUser,
        ...profileResponse.data.data.user
      }));
      
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
