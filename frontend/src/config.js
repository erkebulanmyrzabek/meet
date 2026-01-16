// Use environment variables if available (for production)
// Otherwise default to Render.com backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://meet-f4ff.onrender.com/api';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'wss://meet-f4ff.onrender.com/ws';

export default {
  baseURL: API_BASE_URL,
  wsURL: WS_BASE_URL,
};
