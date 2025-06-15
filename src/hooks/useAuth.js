import { useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthContext from '../context/AuthContext';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';
import axios from 'axios';

const AUTH_API_URL = 'http://localhost:3007/api/auth';

const useAuth = () => {
  const authContext = useContext(AuthContext);
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector(state => state.auth);
  
  const login = useCallback(async (username, password) => {
    dispatch(loginStart());
    
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, { username, password });
      const { token, user } = response.data;
      
      // Save auth token to localStorage
      localStorage.setItem('token', token);
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Dispatch success action
      dispatch(loginSuccess(user));
      
      // Show success toast
      dispatch(addToast({
        type: 'success',
        message: 'Đăng nhập thành công!'
      }));
      
      return true;
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
    isAuthenticated: !!user,
  };
};

export default useAuth; 