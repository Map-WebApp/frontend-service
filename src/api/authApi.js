import axios from 'axios';

// Tạo instance axios với baseURL là proxy của Vite
const api = axios.create({
    baseURL: '/api/auth'
});

// Interceptor để log ra mọi yêu cầu
api.interceptors.request.use(
    config => {
        console.log('Request:', config.method, config.url, config.data);
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor để log ra mọi phản hồi
api.interceptors.response.use(
    response => {
        console.log('Response:', response.status, response.data);
        return response;
    },
    error => {
        console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

export const register = async (username, password) => {
    try {
        console.log('Sending registration request to /api/auth/register');
        const response = await api.post('/register', { username, password });
        return response.data;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

export const login = async (username, password) => {
    try {
        const response = await api.post('/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

export default {
    register,
    login,
    logout,
    isAuthenticated
}; 