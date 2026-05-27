import FormRegistro from '../components/FormRegistro';
import { useState } from 'react';

export default function InicioPage() {
  const [key, setKey] = useState(0);
  return (
    <>
      <FormRegistro key={key} onGuardado={() => setKey(k => k + 1)} />
    </>
  );
}
