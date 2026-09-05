/**
 * api.js — Centralized fetch wrapper with JWT authorization.
 * All API calls go through this module for consistent auth handling.
 */

const BASE = ''; // same-origin in production, Vite proxy in dev

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  if (res.status === 401 || res.status === 403) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (data) => fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),

  register: (data) => fetch(`${BASE}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
};

// ── Dashboard ─────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => fetch(`${BASE}/api/dashboard/stats`, { headers: getHeaders() }).then(handleResponse),
};

// ── Projects ──────────────────────────────────────────────
export const projectApi = {
  getAll:  ()     => fetch(`${BASE}/api/projects`, { headers: getHeaders() }).then(handleResponse),
  getOne:  (id)   => fetch(`${BASE}/api/projects/${id}`, { headers: getHeaders() }).then(handleResponse),
  create:  (data) => fetch(`${BASE}/api/projects`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  update:  (id, data) => fetch(`${BASE}/api/projects/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  delete:  (id)   => fetch(`${BASE}/api/projects/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};

// ── Tasks ─────────────────────────────────────────────────
export const taskApi = {
  getAll:         (projectId) => {
    const url = projectId ? `${BASE}/api/tasks?projectId=${projectId}` : `${BASE}/api/tasks`;
    return fetch(url, { headers: getHeaders() }).then(handleResponse);
  },
  getSubtasks:    (parentId) => fetch(`${BASE}/api/tasks/${parentId}/subtasks`, { headers: getHeaders() }).then(handleResponse),
  create:         (data) => fetch(`${BASE}/api/tasks`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  createSubtask:  (parentId, data) => fetch(`${BASE}/api/tasks`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ ...data, parentTaskId: parentId, type: 'SUBTASK' }) }).then(handleResponse),
  update:         (id, data) => fetch(`${BASE}/api/tasks/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateStatus:   (id, status) => fetch(`${BASE}/api/tasks/${id}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
  delete:         (id) => fetch(`${BASE}/api/tasks/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};

// ── Comments ──────────────────────────────────────────────
export const commentApi = {
  getAll:   (taskId) => fetch(`${BASE}/api/tasks/${taskId}/comments`, { headers: getHeaders() }).then(handleResponse),
  create:   (taskId, data) => fetch(`${BASE}/api/tasks/${taskId}/comments`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  update:   (taskId, commentId, data) => fetch(`${BASE}/api/tasks/${taskId}/comments/${commentId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
};

// ── Users (Admin only) ────────────────────────────────────
export const userApi = {
  getAll: () => fetch(`${BASE}/api/users`, { headers: getHeaders() }).then(handleResponse),
};
