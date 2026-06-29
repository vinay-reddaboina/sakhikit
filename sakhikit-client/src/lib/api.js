const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

async function request(endpoint, options = {}, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
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

// Public
export const api = {
  getHealth: () => request('/api/health'),
  getCauses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/causes?${query}`);
  },
  getCauseById: (id) => request(`/api/causes/${id}`),
  getCauseStats: () => request('/api/causes/stats'),
  getVerifiedNGOs: () => request('/api/ngos'),
  getNGOById: (id) => request(`/api/ngos/${id}`),
  getImpactByCause: (causeId) => request(`/api/impact/cause/${causeId}`),
  getAllImpactUpdates: () => request('/api/impact/all'),
};

export const authApi = {
  syncUser: (token) => request('/api/users/sync', { method: 'POST' }, token),
  getMe: (token) => request('/api/users/me', {}, token),
  registerNGO: (token, data) => request('/api/ngos', { method: 'POST', body: JSON.stringify(data) }, token),
  getMyNGO: (token) => request('/api/ngos/mine', {}, token),
  getPendingNGOs: (token) => request('/api/ngos/pending', {}, token),
  verifyNGO: (token, id, data) => request(`/api/ngos/${id}/verify`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  createCause: (token, data) => request('/api/causes', { method: 'POST', body: JSON.stringify(data) }, token),
  getMyCauses: (token) => request('/api/causes/ngo/mine', {}, token),
  updateCause: (token, id, data) => request(`/api/causes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  deleteCause: (token, id) => request(`/api/causes/${id}`, { method: 'DELETE' }, token),
  createPaymentIntent: (token, data) => request('/api/donations/create-payment-intent', { method: 'POST', body: JSON.stringify(data) }, token),
  createSubscription: (token, data) => request('/api/donations/create-subscription', { method: 'POST', body: JSON.stringify(data) }, token),
  getMyDonations: (token) => request('/api/donations/my', {}, token),
  createImpactUpdate: (token, data) => request('/api/impact', { method: 'POST', body: JSON.stringify(data) }, token),
  uploadPhoto: (token, formData) => {
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    return fetch(`${BASE_URL}/api/impact/upload-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((r) => r.json());
  },
};