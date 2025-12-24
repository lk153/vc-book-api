import axios from 'axios';

export const brevoClient = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'api-key': process.env.BREVO_API_KEY
  }
});

/**
 * Optional: response interceptor for centralized error logging
 */
brevoClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const data = error.response?.data;

    console.error('Brevo API error', {
      status,
      data
    });

    return Promise.reject(error);
  }
);
