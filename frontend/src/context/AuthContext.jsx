import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api'; // Assuming the API file is named api.js

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Validate token by fetching the profile
          const profile = await auth.getProfile();
          setUser({ ...profile.data, token });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await auth.login(credentials);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser({ ...userData, token });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      console.log("=========================");
      const response = await auth.signup(userData);
      console.log(response);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser({ ...userData, token });
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
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
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
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

export default AuthContext;
