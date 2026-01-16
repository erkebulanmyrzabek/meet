import axios from 'axios';
import config from '../config';

const api = axios.create({
    baseURL: config.baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const roomService = {
    async createRoom(name = '') {
        const response = await api.post('/rooms/', { name });
        return response.data;
    },

    async getRoomByCode(code) {
        const response = await api.get(`/rooms/${code}/`);
        return response.data;
    },

    async joinRoom(code) {
        const response = await api.get(`/rooms/${code}/join/`);
        return response.data;
    },
};

export default api;
