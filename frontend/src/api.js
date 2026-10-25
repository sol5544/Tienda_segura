// Cliente de la API. Aquí se ve CORS en acción: 5173 (frontend) -> 3000 (backend)
const API = 'http://localhost:3000/api';
export async function request(ruta, { method = 'GET', body, token } = {}) {
 const headers = {};
 if (body) headers['Content-Type'] = 'application/json';
 if (token) headers.Authorization = `Bearer ${token}`; // JWT en cada petición
 const res = await fetch(`${API}${ruta}`, {
 method,
 headers,
 body: body ? JSON.stringify(body) : undefined,
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) throw new Error(data.error || 'Error en la petición');
 return data;
}