const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getDocentes = () => 
  fetch(`${BASE}/docentes`).then(r => r.json());

export const getCarreras = () => 
  fetch(`${BASE}/carreras`).then(r => r.json());

export const getMaterias = (idCarrera) =>
  fetch(`${BASE}/carreras/${idCarrera}/materias`).then(r => r.json());

export const getDocentesByCarrera = (idCarrera) =>
  fetch(`${BASE}/carreras/${idCarrera}/docentes`).then(r => r.json());

export const getLaboratorios = () => 
  fetch(`${BASE}/laboratorios`).then(r => r.json());

export const getTipos = () => 
  fetch(`${BASE}/tipos`).then(r => r.json());

export const getRegistros = (filtros = {}) => {
  const params = new URLSearchParams(filtros);
  return fetch(`${BASE}/registros?${params}`).then(r => r.json());
};

export const verificarLaboratorioOcupado = (datos) => {
  const params = new URLSearchParams({
    id_laboratorio: datos.id_laboratorio,
    fecha: datos.fecha,
    hora_entrada: datos.hora_entrada,
    hora_salida: datos.hora_salida,
  });

  return fetch(`${BASE}/registros/laboratorio-ocupado?${params}`).then(r => r.json());
};

export const crearRegistro = (datos) =>
  fetch(`${BASE}/registros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }).then(r => r.json());

export const getResumen = (f) => fetchReporte('resumen', f);
export const getReporteLabs = (f) => fetchReporte('laboratorios', f);
export const getReporteTipo = (f) => fetchReporte('tipo-practica', f);
export const getReporteDocentes = (f) => fetchReporte('docentes', f);

function fetchReporte(endpoint, filtros = {}) {
  const params = new URLSearchParams(filtros);
  return fetch(`${BASE}/reportes/${endpoint}?${params}`).then(r => r.json());
}

// ✅ getEventos ahora acepta filtros de fecha
export const getEventos = (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
  if (filtros.fecha_fin)    params.append('fecha_fin',    filtros.fecha_fin);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetch(`${BASE}/eventos${query}`).then(r => r.json());
};

export const crearEvento = (datos) =>
  fetch(`${BASE}/eventos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }).then(r => r.json());

export const generarQRDocente = async (id) => {
  const res = await fetch(`${BASE}/docentes/${id}/generar-qr`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'No se pudo generar el QR');
  }

  return data;
};

export const validarQRDocente = (token, id_docente) =>
  fetch(`${BASE}/docentes/validar-qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, id_docente }),
  }).then(r => r.json());