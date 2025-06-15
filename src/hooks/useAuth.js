import { useContext, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthContext from '../context/AuthContext';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Thay thế URL hardcode bằng proxy URL
const AUTH_API_URL = '/api/auth';

const useAuth = () => {
  const authContext = useContext(AuthContext);
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector(state => state.auth);
  
  // Tính toán trạng thái đăng nhập từ user
  const isAuthenticated = useMemo(() => !!user, [user]);
  
  const login = useCallback(async (username, password) => {
    dispatch(loginStart());
    
    try {
      console.log('Attempting to login with:', { username });
      const response = await axios.post(`${AUTH_API_URL}/login`, { username, password });
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        const token = response.data.token;
        
        // Save auth token to localStorage
        localStorage.setItem('token', token);
        
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Decode the token to get user information
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        
        // Create user object from token data
        const userData = {
          username: decoded.username
        };
        
        // Dispatch success action with user data
        dispatch(loginSuccess(userData));
        
        // Show success toast
        dispatch(addToast({
          type: 'success',
          message: 'Đăng nhập thành công!'
        }));
        
        return true;
      } else {
        throw new Error('Invalid response format - no token received');
      }
    } catch (error) {
      console.error("Login error:", error);
      
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      dispatch(loginFailure(errorMessage));
      
      dispatch(addToast({
        type: 'error',
        message: errorMessage
      }));
      
      return false;
    }
  }, [dispatch]);
  
  const register = useCallback(async (username, password) => {
    try {
      await axios.post(`${AUTH_API_URL}/register`, { username, password });
      
      dispatch(addToast({
        type: 'success',
        message: 'Đăng ký thành công! Vui lòng đăng nhập.'
      }));
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      
      dispatch(addToast({
        type: 'error',
        message: errorMessage
      }));
      
      return false;
    }
  }, [dispatch]);
  
  const logout = useCallback(() => {
    // Remove token from storage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Dispatch logout action
    dispatch(logoutAction());
    
    console.log('User logged out, state cleared');
    
    dispatch(addToast({
      type: 'info',
      message: 'Đã đăng xuất'
    }));
  }, [dispatch]);
  
  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };
};

export default useAuth; 