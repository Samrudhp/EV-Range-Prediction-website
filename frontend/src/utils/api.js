import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AI Query endpoint
export const queryAI = async (query, userId = 'user_001') => {
  try {
    const response = await api.post('/api/query', {
      query,
      user_id: userId,
      include_map: false,
    });
    return response.data;
  } catch (error) {
    console.error('AI Query Error:', error);
    throw error;
  }
};

export default api;
