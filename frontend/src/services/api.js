const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    const errorBody = isJson ? await response.json() : await response.text();
    const message = errorBody && typeof errorBody === 'object' ? errorBody.message || JSON.stringify(errorBody) : errorBody;
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return isJson ? response.json() : response.text();
}

export default {
  fetchJson,
};
