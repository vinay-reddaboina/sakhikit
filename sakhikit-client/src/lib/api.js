// Centralized API client for talking to the Express backend.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Core request function. Optionally accepts a token to authenticate.
async function request(endpoint, options = {}, token = null) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach the JWT as a Bearer token if we have one
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    // Some endpoints (like 204 No Content) have no body
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`Request failed: ${endpoint}`, error);
    throw error;
  }
}

// PUBLIC (no auth) endpoints
export const api = {
  getHealth: () => request('/api/health'),
};

// AUTHENTICATED endpoints — these need a token passed in.
// We expose them as functions that take a token as the last argument.
export const authApi = {
  // Sync the logged-in user into our DB (called right after login).
  // The access token only carries the Auth0 user id, so we send the
  // profile fields (from the ID token) in the body.
  syncUser: (token, profile) =>
    request(
      '/api/users/sync',
      { method: 'POST', body: JSON.stringify(profile) },
      token
    ),

  // Get the current user's profile from our DB
  getMe: (token) => request('/api/users/me', {}, token),
};