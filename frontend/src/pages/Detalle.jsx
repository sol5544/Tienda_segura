import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../api.js';
export default function Detalle() {
 const { id } = useParams(); // ruta dinámica /producto/:id
 const irA = useNavigate();
 const [producto, setProducto] = useState(null);
 const [error, setError] = useState('');
 useEffect(() => {
 let activo = true;
 request(`/productos/${id}`)
 .then((d) => activo && setProducto(d))
 .catch((e) => activo && setError(e.message));
 return () => {
 activo = false;
 };
 }, [id]);
 return (
 <>
 <button onClick={() => irA('/productos')}>← Volver</button>
 {error && <p className="error">{error}</p>}
 {producto && (
 <div className="detalle">
 <h1>{producto.nombre}</h1>
 <p>{producto.descripcion}</p>
 <strong>S/ {producto.precio}</strong>
 </div>
 )}
 </>
 );
}