
export const API_BASE_URL: string = import.meta.env.VITE_API_URL as string;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'slack_connect_token',
  USER_DATA: 'slack_connect_user',
} as const;
