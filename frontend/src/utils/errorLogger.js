import axios from 'axios';
import auth from '../../firebase.config';
import { API_BASE_URL } from './apiConfig';

// Flag to prevent recursive error loops if logging requests fail
let isLogging = false;

/**
 * Sends a client-side error to the backend log database.
 * If a user is logged in, it will dynamically fetch and attach their Firebase JWT ID token.
 * 
 * @param {Error|Object} error The error object or error details
 * @param {Object} [extraDetails] Additional context (e.g. method, status, path)
 */
export const logErrorToBackend = async (error, extraDetails = {}) => {
  if (isLogging) return; // Prevent infinite log loops
  
  try {
    isLogging = true;

    const baseUrl = API_BASE_URL || 'http://localhost:3000/api/';
    const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const endpoint = `${cleanUrl}/error-logs/client`;

    let message = 'Unknown Client Error';
    let stack = '';
    let status = extraDetails.status || 500;

    const isAxiosError = axios.isAxiosError(error) || (error && (error.isAxiosError || error.config || error.response));

    if (isAxiosError) {
      const method = error.config?.method?.toUpperCase() || extraDetails.method || 'UNKNOWN';
      const url = error.config?.url || 'UNKNOWN_URL';
      status = error.response?.status || error.status || 500;
      
      let responseBody = 'No response body';
      if (error.response?.data) {
        responseBody = typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data, null, 2) 
          : String(error.response.data);
      }

      // Read response error message if available
      const backendMessage = error.response?.data?.message || error.response?.data?.error || '';
      
      message = `API Error [${method} ${url}] Status: ${status}`;
      if (backendMessage) {
        message += ` - ${backendMessage}`;
      } else {
        message += ` - ${error.message || 'Request failed'}`;
      }

      // Detailed Stack trace with API request and response data
      stack = `--- API REQUEST DETAILS ---
Method: ${method}
URL: ${url}
Request Data: ${error.config?.data ? (typeof error.config.data === 'string' ? error.config.data : JSON.stringify(error.config.data, null, 2)) : 'None'}
Headers: ${error.config?.headers ? JSON.stringify(error.config.headers, null, 2) : 'None'}

--- API RESPONSE DETAILS ---
Status: ${status}
Response Body: ${responseBody}

--- CLIENT STACK TRACE ---
${error.stack || 'No client stack trace available.'}`;

    } else if (error instanceof Error) {
      message = error.message;
      stack = error.stack || '';
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      message = error.message || error.reason || JSON.stringify(error);
      stack = error.stack || '';
    }

    const payload = {
      message,
      stack,
      path: extraDetails.path || window.location.href,
      method: isAxiosError ? `CLIENT_${error.config?.method?.toUpperCase() || 'API'}` : (extraDetails.method || 'CLIENT'),
      status,
    };

    // Set up request headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // If a user is authenticated, attach their bearer token
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (authErr) {
        console.warn('Failed to retrieve Firebase ID token for error logging:', authErr);
      }
    }

    // Use vanilla axios to make a direct API call
    await axios.post(endpoint, payload, { headers });
  } catch (logErr) {
    // Fail silently to prevent console/crash loops
    console.error('Failed to log client-side error to backend:', logErr.message);
  } finally {
    isLogging = false;
  }
};

/**
 * Configures global browser error handlers to automatically catch and report errors.
 */
export const setupGlobalErrorLogging = () => {
  if (typeof window === 'undefined') return;

  // Catch unhandled runtime errors
  window.addEventListener('error', (event) => {
    // Ignore cross-origin script errors with no details
    if (event.message === 'Script error.' && !event.filename) {
      return;
    }

    const errorDetails = {
      path: window.location.href,
      method: 'CLIENT_GLOBAL',
      status: 500
    };

    logErrorToBackend(event.error || {
      message: event.message,
      stack: `at ${event.filename || 'unknown'}:${event.lineno || 0}:${event.colno || 0}`
    }, errorDetails);
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorDetails = {
      path: window.location.href,
      method: 'CLIENT_PROMISE',
      status: 500
    };

    const reason = event.reason;
    if (reason instanceof Error) {
      logErrorToBackend(reason, errorDetails);
    } else {
      logErrorToBackend({
        message: typeof reason === 'string' ? reason : 'Unhandled Promise Rejection',
        stack: reason && typeof reason === 'object' ? JSON.stringify(reason) : String(reason)
      }, errorDetails);
    }
  });

  console.log('Global client error logging initialized successfully.');
};
