const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const escape = require('escape-html');
const db = require('./db');
const { firmarToken, auth } = require('./auth');
const app = express();
const PORT = process.env.PORT || 3000;
const ORIGEN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
// ---------- Seguridad global ----------
app.use(helmet()); // cabeceras seguras (XSS, clickjacking, sniffing...)
app.use(
 cors({
 origin: ORIGEN, // solo el frontend; nunca '*'
 methods: ['GET', 'POST', 'PUT', 'DELETE'],
 allowedHeaders: ['Content-Type', 'Authorization'],
 })
);
app.use(express.json({ limit: '10kb' }));


// ---------- Validaciones ----------
const emailValido = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ---------- Autenticación ----------
app.post('/api/register', async (req, res) => {
 try {
 const { nombre, email, password } = req.body || {};
 if (typeof nombre !== 'string' || nombre.trim().length < 2)
 return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
 if (!emailValido(email))
 return res.status(400).json({ error: 'Correo inválido' });
 if (typeof password !== 'string' || password.length < 6)
 return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
 const existe = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
 if (existe) return res.status(409).json({ error: 'Ese correo ya está registrado' });
 const hash = await bcrypt.hash(password, 10);
 db.prepare('INSERT INTO users (nombre, email, password) VALUES (?, ?, ?)').run(
 nombre.trim(),
 email,
 hash
 );
 res.status(201).json({ mensaje: 'Usuario creado' });
 } catch (error) {
 console.error(error);
 res.status(500).json({ error: 'Error del servidor' });
 }
});
app.post('/api/login', async (req, res) => {
 try {
 const { email, password } = req.body || {};
 if (!emailValido(email) || typeof password !== 'string')
 return res.status(400).json({ error: 'Correo o contraseña inválidos' });
 // Consulta PARAMETRIZADA: el email viaja como dato, no como SQL
 const usuario = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
 const ok = usuario && (await bcrypt.compare(password, usuario.password));
 if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });
 const token = firmarToken(usuario);
 res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
 } catch (error) {
 console.error(error);
 res.status(500).json({ error: 'Error del servidor' });
 }
});
// Ruta privada: requiere token válido
app.get('/api/perfil', auth, (req, res) => {
 const usuario = db.prepare('SELECT id, nombre, email FROM users WHERE id = ?').get(req.user.id);
 if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
 res.json({ ...usuario, expira: req.user.exp });
});

// ---------- Productos ----------
app.get('/api/productos', (req, res) => {
 const q = String(req.query.q || '').slice(0, 50);
 const filas = db
 .prepare('SELECT * FROM productos WHERE nombre LIKE ? ORDER BY id')
 .all(`%${q}%`);
 res.json(filas);
});
app.get('/api/productos/:id', (req, res) => {
 const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(Number(req.params.id));
 if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
 res.json(producto);
});
app.post('/api/productos', auth, (req, res) => {
 const { nombre, precio, descripcion = '' } = req.body || {};
 if (typeof nombre !== 'string' || nombre.trim().length < 2)
 return res.status(400).json({ error: 'Nombre inválido' });
 if (typeof precio !== 'number' || !(precio > 0))
 return res.status(400).json({ error: 'Precio inválido' });
 const r = db
 .prepare('INSERT INTO productos (nombre, precio, descripcion) VALUES (?, ?, ?)')
 .run(nombre.trim(), precio, String(descripcion).slice(0, 300));
 res.status(201).json({ id: Number(r.lastInsertRowid), nombre, precio, descripcion });
});

// ---------- XSS: salida escapada ----------
app.get('/buscar', (req, res) => {
 const q = String(req.query.q || '');
 res.send(`<h1>Resultados para: ${escape(q)}</h1>`);
});


// ---------- DEMOSTRACIÓN DE VULNERABILIDADES (solo para clase) ----------
// Se activan con DEMO_INSEGURO=true en .env. NUNCA en producción.
if (process.env.DEMO_INSEGURO === 'true') {
 // SQL Injection: consulta armada con texto concatenado
 app.get('/demo/usuarios-inseguro', (req, res) => {
 const email = req.query.email || '';
 const sql = `SELECT id, nombre, email FROM users WHERE email = '${email}'`;
 try {
 res.json({ sql, resultado: db.prepare(sql).all() });
 } catch (e) {
 res.status(400).json({ sql, error: e.message });
 }
 });
 // XSS reflejado: la entrada se imprime sin escapar
 app.get('/demo/buscar-inseguro', (req, res) => {
 res.type('html').send(`<h1>Resultados para: ${req.query.q || ''}</h1>`);
 });
}

// ---------- Errores ----------
app.use((err, req, res, next) => {
 if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
 console.error(err);
 res.status(500).json({ error: 'Error del servidor' });
});
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));