import { useEffect, useRef, useState } from 'react';
import Tarjeta from '../components/Tarjeta.jsx';
import { request } from '../api.js';
export default function Productos() {
 const [productos, setProductos] = useState([]);
 const [q, setQ] = useState('');
 const [cargando, setCargando] = useState(true);
 const [error, setError] = useState('');
 const campo = useRef(); // formulario NO controlado: se lee con una ref
 // Se ejecuta al montar y cada vez que cambia "q" (actualización)
 useEffect(() => {
 let activo = true;
 setCargando(true);
 request(`/productos?q=${encodeURIComponent(q)}`)
 .then((datos) => {
 if (activo) {
 setProductos(datos);
 setError('');
 }
 })
 .catch((e) => activo && setError(e.message))
 .finally(() => activo && setCargando(false));
 return () => {
 activo = false; // desmontaje: evita actualizar un componente que ya no existe
 };
 }, [q]);
 const buscar = (e) => {
 e.preventDefault();
 setQ(campo.current.value);
 };
 return (
 <>
 <h1>Productos</h1>
 <form onSubmit={buscar} className="fila">
 <input ref={campo} placeholder="Buscar producto..." />
 <button type="submit">Buscar</button>
 </form>
 {/* React escapa el JSX: si escribes <script> se muestra como texto */}
 {q && <p>Resultados para: {q}</p>}
 {cargando && <p>Cargando...</p>}
 {error && <p className="error">{error}</p>}
 {!cargando && !error && productos.length === 0 && <p>Sin resultados.</p>}
 <div className="rejilla">
 {productos.map((p) => (
 <Tarjeta key={p.id} id={p.id} titulo={p.nombre} precio={p.precio} />
 ))}
 </div>
 </>
 );
}
