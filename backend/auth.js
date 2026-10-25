// JWT: firmar y verificar (slides 5 y 6)
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 16) {
 console.error('Falta JWT_SECRET (mínimo 16 caracteres) en el archivo .env');
 process.exit(1);
}
function firmarToken(usuario) {
 return jwt.sign({ id: usuario.id, email: usuario.email }, SECRET, {
 expiresIn: '1h',
 });
}
// Middleware: lee "Authorization: Bearer <token>", verifica y deja el payload en req.user
function auth(req, res, next) {
 const token = (req.headers.authorization || '').split(' ')[1];
 try {
 req.user = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
 next();
 } catch (error) {
 res.status(401).json({ error: 'Token inválido o expirado' });
 }}
 module.exports = { firmarToken, auth };
