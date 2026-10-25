import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api.js';
// Formulario CONTROLADO: el valor de cada campo vive en el estado de React
export default function Registro() {

 const [form, setForm] = useState({ nombre: '', email: '', password: '' });
 const [errores, setErrores] = useState({});
 const [mensaje, setMensaje] = useState('');
 const irA = useNavigate();
 const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });
 const validar = () => {
 const x = {};
 if (form.nombre.trim().length < 2) x.nombre = 'Mínimo 2 caracteres';
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) x.email = 'Correo inválido';
 if (form.password.length < 6) x.password = 'Mínimo 6 caracteres';
 return x;
 };
 const enviar = async (e) => {
 e.preventDefault();
 const x = validar();
 setErrores(x);
 if (Object.keys(x).length) return;
 try {
 await request('/register', { method: 'POST', body: form });
 setMensaje('Cuenta creada. Redirigiendo al login...');
 setTimeout(() => irA('/login'), 1200);
 } catch (err) {
 setErrores({ general: err.message });
 }
 };
 return (
 <form onSubmit={enviar} className="formulario" noValidate>
 <h1>Registro</h1>
 <label>Nombre</label>
 <input name="nombre" value={form.nombre} onChange={cambiar} />
 {errores.nombre && <small className="error">{errores.nombre}</small>}
 <label>Correo</label>
 <input name="email" type="email" value={form.email} onChange={cambiar} />
 {errores.email && <small className="error">{errores.email}</small>}
 <label>Contraseña</label>
 <input name="password" type="password" value={form.password} onChange={cambiar} />
 {errores.password && <small className="error">{errores.password}</small>}
 {errores.general && <p className="error">{errores.general}</p>}
 {mensaje && <p className="ok">{mensaje}</p>}
 <button type="submit">Crear cuenta</button>
 </form>
 );
}