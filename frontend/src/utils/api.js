import axios from 'axios';

// In the pooji_serverless branch we call Vercel Serverless Functions
// on the same origin (no external backend host).
const api = axios.create({
  baseURL: '',
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
