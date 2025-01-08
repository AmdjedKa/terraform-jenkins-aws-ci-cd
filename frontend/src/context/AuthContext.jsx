import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (e.g., check localStorage or token)
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and set user
      // This is where you'd typically make an API call to validate the token
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Make API call to login
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // For now, just mock the response
      const mockToken = 'mock-token';
      localStorage.setItem('token', token);
      setUser({ token: token });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      // Make API call to register
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // For now, just mock the response
      const mockToken = 'mock-token';
      localStorage.setItem('token', token);
      setUser({ token: token });
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
