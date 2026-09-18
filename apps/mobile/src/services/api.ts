/**
 * Anagu Mobile — API client (axios)
 * Injects Supabase session token as Bearer auth.
 */
import axios, { InternalAxiosRequestConfig } from 'axios';
import { getSessionToken } from './supabase';

const API_URL = 'http://localhost:3001/api/v1'; // change for prod

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getSessionToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const applicationsApi = {
  submit:  (body: Record<string, unknown>) => api.post('/applications', body),
  getOne:  (id: string)                    => api.get(`/applications/${id}`),
  list:    ()                              => api.get('/applications'),
};

export const gisApi = {
  verify: (coordinates: [number, number][]) => api.post('/gis/verify', { coordinates }),
};

export const titlesApi = {
  getOne: (tokenId: string) => api.get(`/titles/${tokenId}`),
};
