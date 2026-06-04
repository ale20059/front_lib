import api from '../api/axios';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        if (response.data.token) {
            // Guardamos el token y los datos del usuario
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: async () => {
        await api.post('/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};