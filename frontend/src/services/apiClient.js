const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function request(endpoint, options = {}) {
  const isAdmin = endpoint.includes('/admin');
  const adminToken = localStorage.getItem('sri_sankara_admin_token');
  const customerToken = localStorage.getItem('sri_sankara_customer_token');
  const token = isAdmin ? adminToken : (customerToken || adminToken);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // If response is a file download (like CSV export)
  if (response.headers.get('content-type')?.includes('text/csv')) {
    if (!response.ok) {
      throw new ApiError('Failed to download CSV export', response.status);
    }
    return response.blob();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || `Request failed with status ${response.status}`, response.status, data);
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
};
