
import { refreshToken, logout } from './auth';

async function api(endpoint: string, options: RequestInit = {}) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL not configured');
  }

  const url = `${backendUrl}${endpoint}`;
  const token = localStorage.getItem('accessToken');

  const headers = { ...options.headers } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // If a header is explicitly set to undefined, remove it.
  // This is useful for FormData where the browser needs to set the Content-Type.
  for (const key in headers) {
    if (headers[key] === undefined) {
      delete headers[key];
    }
  }
  
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    try {
      // Attempt to refresh the token
      const newTokens = await refreshToken();
      headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
      
      // Retry the request with the new token
      response = await fetch(url, { ...options, headers });

    } catch (refreshError) {
      // If refresh token fails, logout the user and stop execution
      console.error("Session expired. Please log in again.", refreshError);
      await logout();
      // Throw an error to prevent the original call from proceeding
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An API error occurred');
  }

  // Handle responses with no content
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return; // Or handle as text, blob, etc., if needed
  }
}

export { api };
