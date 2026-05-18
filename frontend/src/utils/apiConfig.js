// Shared API configuration to keep hooks and error loggers in sync
// export const API_BASE_URL = import.meta.env.VITE_live_url;
// To switch back to the local development backend, uncomment the line below:
export const API_BASE_URL = import.meta.env.VITE_local_url || 'http://localhost:3000/api/';
