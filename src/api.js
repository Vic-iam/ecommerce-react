export const formatPrice = (cents) =>
  new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(cents / 100);

async function request(url, options) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options,
    body: options?.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

export const api = {
  products: () => request('/api/products'),
  product: (id) => request(`/api/products/${id}`),
  cart: (cartId) => request(`/api/cart/${cartId}`),
  addToCart: (cartId, productId, quantity = 1) =>
    request(`/api/cart/${cartId}/items`, { method: 'POST', body: { productId, quantity } }),
  setQuantity: (cartId, productId, quantity) =>
    request(`/api/cart/${cartId}/items/${productId}`, { method: 'PUT', body: { quantity } }),
  remove: (cartId, productId) =>
    request(`/api/cart/${cartId}/items/${productId}`, { method: 'DELETE' }),
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' })
};
