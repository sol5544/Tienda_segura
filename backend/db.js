const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(
  path.join(__dirname, 'tienda.db')
);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS productos (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   nombre TEXT NOT NULL,
   precio REAL NOT NULL,
   descripcion TEXT
);
`);

// Datos de ejemplo la primera vez
const { total } = db.prepare('SELECT COUNT(*) AS total FROM productos').get();
console.log('Productos registrados:', total);
if (total === 0) {
 const insertar = db.prepare(
 'INSERT INTO productos (nombre, precio, descripcion) VALUES (?, ?, ?)'
 );
 [
 ['Teclado mecánico', 80, 'Teclado con switches rojos y retroiluminación.'],
 ['Mouse inalámbrico', 45, 'Mouse ergonómico de 1600 DPI.'],
 ['Monitor 24"', 520, 'Monitor Full HD con panel IPS.'],
 ['Audífonos USB', 95, 'Audífonos con micrófono para videollamadas.'],
 ['Webcam HD', 110, 'Cámara 1080p con enfoque automático.'],
 ].forEach((p) => insertar.run(...p));
}
module.exports = db;