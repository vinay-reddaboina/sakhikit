// Centralized API client for talking to the Express backend.
// All backend calls go through here so we have one place to:
//   - Set the base URL (changes between dev/prod)
//   - Add auth tokens (Day 2)
//   - Handle errors consistently

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Generic request helper
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Server returned 4xx or 5xx
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Request failed: ${endpoint}`, error);
    throw error;
  }
}

// Public API methods — feature-named so consuming components are readable
export const api = {
  // Health
  getHealth: () => request('/api/health'),

  // We'll add more methods here as we build features:
  // getCauses, createDonation, getNGOs, etc.
};