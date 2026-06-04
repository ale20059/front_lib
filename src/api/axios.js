import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // La URL de tu servidor Laravel
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Este "interceptor" adjunta el token automáticamente si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;