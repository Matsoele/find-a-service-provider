import axios from 'axios';

export const API_BASE = 'https://fasp-backend.onrender.com';
export const api = axios.create({ baseURL: `${API_BASE}/api` });

// Attach provider token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fasp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const cust = localStorage.getItem('fasp_customer_token');
  if (cust) config.headers['x-customer-token'] = cust;
  return config;
});