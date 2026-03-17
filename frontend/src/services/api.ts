const BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || 'Erro na requisição');
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ============ AUTH ============
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; employee: any }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    }),
  me: () => request<any>('/api/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<any>('/api/auth/change-password', {
      method: 'POST', body: JSON.stringify({ currentPassword, newPassword })
    }),
};

// ============ CUSTOMERS ============
export const customersApi = {
  list: (search?: string) => request<any[]>(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id: string) => request<any>(`/api/customers/${id}`),
  create: (data: any) => request<any>('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/customers/${id}`, { method: 'DELETE' }),
};

// ============ ORDERS ============
export const ordersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/api/orders${qs}`);
  },
  get: (id: string) => request<any>(`/api/orders/${id}`),
  create: (data: any) => request<any>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string, notes?: string) =>
    request<any>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  delete: (id: string) => request<void>(`/api/orders/${id}`, { method: 'DELETE' }),
};

// ============ PRODUCTS ============
export const productsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/api/products${qs}`);
  },
  get: (id: string) => request<any>(`/api/products/${id}`),
  categories: () => request<string[]>('/api/products/categories'),
  create: (data: any) => request<any>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') =>
    request<any>(`/api/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ quantity, operation }) }),
  delete: (id: string) => request<void>(`/api/products/${id}`, { method: 'DELETE' }),
};

// ============ PRODUCTION ============
export const productionApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/api/production${qs}`);
  },
  get: (id: string) => request<any>(`/api/production/${id}`),
  create: (data: any) => request<any>('/api/production', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/api/production/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/production/${id}`, { method: 'DELETE' }),
};

// ============ EMPLOYEES ============
export const employeesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/api/employees${qs}`);
  },
  get: (id: string) => request<any>(`/api/employees/${id}`),
  me: () => request<any>('/api/employees/me'),
  create: (data: any) => request<any>('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/employees/${id}`, { method: 'DELETE' }),
};

// ============ TIME RECORDS ============
export const timeRecordsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/api/time-records${qs}`);
  },
  latest: (employeeId: string) => request<any>(`/api/time-records/employee/${employeeId}/latest`),
  summary: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/api/time-records/summary${qs}`);
  },
  create: (data: any) => request<any>('/api/time-records', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/time-records/${id}`, { method: 'DELETE' }),
};

// ============ TRANSACTIONS ============
export const transactionsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/api/transactions${qs}`);
  },
  summary: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/api/transactions/summary${qs}`);
  },
  create: (data: any) => request<any>('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/transactions/${id}`, { method: 'DELETE' }),
};

// ============ DASHBOARD ============
export const dashboardApi = {
  stats: () => request<any>('/api/dashboard/stats'),
  revenue: (period?: number) => request<any[]>(`/api/dashboard/revenue${period ? `?period=${period}` : ''}`),
};

// ============ SETTINGS ============
export const settingsApi = {
  get: () => request<Record<string, string>>('/api/settings'),
  update: (data: Record<string, string>) => request<Record<string, string>>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
