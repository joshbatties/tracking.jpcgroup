export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_CONFIG = {
  timeout: 10000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json'
  }
};