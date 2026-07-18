export const API_BASE_URL = 'http://localhost:3000/api';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'API Request failed');
  }

  return response.json();
};

export const api = {
  events: {
    getAll: () => fetchApi('/events'),
    getFeatured: () => fetchApi('/events?featured=true'),
    getById: (id) => fetchApi(`/events/${id}`),
  },
  auth: {
    login: (credentials) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  }
};
