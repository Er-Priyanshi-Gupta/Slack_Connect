import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants';
import type { Channel, ScheduledMessage } from '@/types';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  initiateSlackAuth: () => {
    window.location.href = `${API_BASE_URL}/auth/slack`;
  },
  
  logout: () => api.post('/auth/logout'),
};

export const channelsAPI = {
  getChannels: (): Promise<{ data: { channels: Channel[] } }> =>
    api.get('/api/channels'),
};

export const messagesAPI = {
  sendMessage: (channelId: string, message: string) =>
    api.post('/api/messages/send', { channelId, message }),
  
  scheduleMessage: (channelId: string, channelName: string, message: string, scheduledTime: string) =>
    api.post('/api/messages/schedule', { channelId, channelName, message, scheduledTime }),
  
  getScheduledMessages: (): Promise<{ data: { messages: ScheduledMessage[] } }> =>
    api.get('/api/messages/scheduled'),
  
  cancelScheduledMessage: (id: number) =>
    api.delete(`/api/messages/scheduled/${id}`),
};

export default api;
