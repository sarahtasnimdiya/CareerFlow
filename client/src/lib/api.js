export function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  }).then(response => response.json());
}

export function trackRecentAttribute(id) {
  const stored = localStorage.getItem('recentAttributes');
  let recent = stored ? JSON.parse(stored) : [];
  recent = recent.filter(existingId => existingId !== id);
  recent.unshift(id);
  recent = recent.slice(0, 5);
  localStorage.setItem('recentAttributes', JSON.stringify(recent));
}