// API Configuration
// Reads the base URL from Vite environment variables.
// Make sure you have VITE_API_BASE_URL defined in your .env file.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://staging-ims-api.ezmedtech.ai';

