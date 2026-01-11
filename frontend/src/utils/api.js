import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProfiles = async () => {
  const response = await api.get('/api/profiles');
  return response.data;
};

export const fetchSnapshot = async (period, question, profile) => {
  const response = await api.post('/api/snapshot', {
    period,
    question,
    profile,
  });
  return response.data;
};

export const fetchSimulation = async (period, question, profile) => {
  const response = await api.post('/api/simulate', {
    period,
    question,
    profile,
  });
  return response.data;
};

export default api;
