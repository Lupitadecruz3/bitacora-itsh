import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell,
         XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getResumen, getReporteLabs, getReporteTipo } from '../api/api';

const COLORES = ['#0F6E56', '#BA7517', '#185FA5', '#993C1D', '#534AB7'];

export default function Dashboard() {
  const [resumen,  setResumen]  = useState(null);
  const [labs,     setLabs]     = useState([]);
  const [tipos,    setTipos]    = useState([]);

  useEffect(() => {
    getResumen().then(setResumen);
    getReporteLabs().then(setLabs);
    getReporteTipo().then(setTipos);
  }, []);

  return (
    <div className="dashboard">

      {/* ── Tarjetas de métricas ───────────── */}
      <div className="metricas-grid">
        <MetricaCard titulo="Total prácticas"    valor={resumen?.total_practicas}     color="#0F6E56" />
        <MetricaCard titulo="Alumnos atendidos"  valor={resumen?.total_alumnos}        color="#BA7517" />
        <MetricaCard titulo="Docentes activos"   valor={resumen?.docentes_activos}     color="#185FA5" />
        <MetricaCard titulo="Laboratorios usados" valor={resumen?.labs_usados}         color="#993C1D" />
      </div>

      {/* ── Gráfica de barras: uso por laboratorio ── */}
      <div className="grafica-card">
        <h3>Uso por Laboratorio</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={labs}>
            <XAxis dataKey="laboratorio" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_usos"    name="Sesiones"  fill="#0F6E56" />
            <Bar dataKey="total_alumnos" name="Alumnos"   fill="#BA7517" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Gráfica de pastel: tipo de práctica ── */}
      <div className="grafica-card">
        <h3>Distribución por Tipo de Práctica</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={tipos} dataKey="total" nameKey="tipo" cx="50%" cy="50%" outerRadius={100} label>
              {tipos.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

function MetricaCard({ titulo, valor, color }) {
  return (
    <div className="metrica-card" style={{ borderLeft: `4px solid ${color}` }}>
      <p className="metrica-titulo">{titulo}</p>
      <p className="metrica-valor">{valor ?? '...'}</p>
    </div>
  );
}