import React, { createContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    
    // Tự động đăng nhập nếu có token trong localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                // Kiểm tra token và tự động đăng nhập
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const decoded = jwtDecode(token);
                
                // Nếu token còn hiệu lực, đăng nhập người dùng
                if (decoded.exp * 1000 > Date.now()) {
                    const user = { username: decoded.username };
                    dispatch(loginSuccess(user));
                } else {
                    // Token hết hạn, xóa token
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            } catch (error) {
                console.error('Token validation error:', error);
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            }
        }
    }, [dispatch]);
    
    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 