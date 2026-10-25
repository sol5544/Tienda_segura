import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { request } from '../api.js';
export default function Login({ alIniciar }) {
 const [error, setError] = useState('');
 const formik = useFormik({
 initialValues: { email: '', password: '' },
 validationSchema: Yup.object({
 email: Yup.string().email('Correo inválido').required('Obligatorio'),
 password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Obligatorio'),
 }),
 onSubmit: async (valores, { setSubmitting }) => {
    setError('');
 try {
 const { token } = await request('/login', { method: 'POST', body: valores });
 alIniciar(token);
 } catch (e) {
 setError(e.message);
 } finally {
 setSubmitting(false);
 }
 },
 });
 return (
 <form onSubmit={formik.handleSubmit} className="formulario" noValidate>
 <h1>Ingresar</h1>
 <label>Correo</label>
 <input type="email" {...formik.getFieldProps('email')} />
 {formik.touched.email && formik.errors.email && (
 <small className="error">{formik.errors.email}</small>
 )}
 <label>Contraseña</label>
 <input type="password" {...formik.getFieldProps('password')} />
 {formik.touched.password && formik.errors.password && (
 <small className="error">{formik.errors.password}</small>
 )}
 {error && <p className="error">{error}</p>}
 <button type="submit" disabled={formik.isSubmitting}>
 {formik.isSubmitting ? 'Ingresando...' : 'Ingresar'}
 </button>
 </form>
 );
}