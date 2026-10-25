import { useState } from 'react';
// useState + evento onClick
export default function Contador() {
 const [n, setN] = useState(0);
 return <button onClick={() => setN(n + 1)}>Clics: {n}</button>;
}

