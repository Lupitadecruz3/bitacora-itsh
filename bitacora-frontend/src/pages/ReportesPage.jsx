import { useState, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { getResumen, getReporteLabs, getReporteTipo, getReporteDocentes, getEventos } from '../api/api';

const COLORES = ['#0F6E56', '#BA7517', '#185FA5', '#993C1D', '#534AB7', '#3B6D11'];

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' });
};

const agregarEventosATipos = (tipos, totalEventos) => {
  const tiposBase = Array.isArray(tipos) ? [...tipos] : [];

  if (totalEventos === 0) {
    return tiposBase;
  }

  const indiceEvento = tiposBase.findIndex(t =>
    String(t.tipo || '').toLowerCase() === 'evento especial'
  );

  if (indiceEvento >= 0) {
    tiposBase[indiceEvento] = {
      ...tiposBase[indiceEvento],
      total: Number(tiposBase[indiceEvento].total || 0) + totalEventos,
    };
    return tiposBase;
  }

  return [...tiposBase, { tipo: 'Evento especial', total: totalEventos }];
};

export default function ReportesPage() {
  const [filtros, setFiltros]   = useState({ fecha_inicio: '', fecha_fin: '' });
  const [datos, setDatos]       = useState({ resumen: null, labs: [], tipos: [], docentes: [], eventos: [] });
  const [generado, setGenerado] = useState(false);
  const [exportando, setExportando] = useState(false);

  const graficasRef = useRef(null);

  // ── Generar reportes ────────────────────────────────────────────────────────
  const generarReportes = async () => {
    const [resumen, labs, tipos, docentes, eventosRaw] = await Promise.all([
      getResumen(filtros),
      getReporteLabs(filtros),
      getReporteTipo(filtros),
      getReporteDocentes(filtros),
      getEventos(),
    ]);

    // Filtrar eventos por rango de fechas si hay filtros
    let eventos = Array.isArray(eventosRaw) ? eventosRaw : [];
    if (filtros.fecha_inicio) {
      eventos = eventos.filter(e => e.fecha >= filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      eventos = eventos.filter(e => e.fecha <= filtros.fecha_fin);
    }

    const tiposConEventos = agregarEventosATipos(tipos, eventos.length);

    setDatos({ resumen, labs, tipos: tiposConEventos, docentes, eventos });
    setGenerado(true);
  };

  // ── Exportar PDF ────────────────────────────────────────────────────────────
  const exportarPDF = async () => {
    setExportando(true);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let cursorY = 15;

    // ── Encabezado ──
    doc.setFillColor(15, 110, 86);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte del Semestre', pageW / 2, 13, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const rango = filtros.fecha_inicio && filtros.fecha_fin
      ? `${filtros.fecha_inicio}  →  ${filtros.fecha_fin}`
      : 'Sin filtro de fecha';
    doc.text(`Período: ${rango}`, pageW / 2, 22, { align: 'center' });
    cursorY = 36;

    // ── Métricas resumen ──
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', 14, cursorY);
    cursorY += 6;

    const metricas = [
      ['Total prácticas',  datos.resumen?.total_practicas  ?? '—'],
      ['Total alumnos',    datos.resumen?.total_alumnos    ?? '—'],
      ['Docentes activos', datos.resumen?.docentes_activos ?? '—'],
      ['Laboratorios',     datos.resumen?.labs_usados      ?? '—'],
      ['Eventos especiales', datos.eventos.length],
    ];
    autoTable(doc, {
      startY: cursorY,
      head: [['Indicador', 'Valor']],
      body: metricas,
      theme: 'grid',
      headStyles: { fillColor: [15, 110, 86], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 248, 244] },
      margin: { left: 14, right: 14 },
    });
    cursorY = doc.lastAutoTable.finalY + 10;

    // ── Uso por laboratorio ──
    if (datos.labs.length > 0) {
      if (cursorY > 220) { doc.addPage(); cursorY = 15; }
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Uso por Laboratorio', 14, cursorY);
      cursorY += 4;
      autoTable(doc, {
        startY: cursorY,
        head: [['Laboratorio', 'Sesiones', 'Alumnos']],
        body: datos.labs.map(l => [l.laboratorio, l.total_usos, l.total_alumnos]),
        theme: 'striped',
        headStyles: { fillColor: [24, 95, 165], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 },
      });
      cursorY = doc.lastAutoTable.finalY + 10;
    }

    // ── Distribución por tipo de práctica ──
    if (datos.tipos.length > 0) {
      if (cursorY > 220) { doc.addPage(); cursorY = 15; }
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribución por Tipo de Práctica', 14, cursorY);
      cursorY += 4;
      autoTable(doc, {
        startY: cursorY,
        head: [['Tipo de Práctica', 'Total']],
        body: datos.tipos.map(t => [t.tipo, t.total]),
        theme: 'striped',
        headStyles: { fillColor: [186, 117, 23], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 },
      });
      cursorY = doc.lastAutoTable.finalY + 10;
    }

    // ── Actividad semanal ──
    if (datos.docentes.length > 0) {
      if (cursorY > 220) { doc.addPage(); cursorY = 15; }
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Actividad Semanal por Docente', 14, cursorY);
      cursorY += 4;
      autoTable(doc, {
        startY: cursorY,
        head: [['Semana', 'Sesiones', 'Alumnos']],
        body: datos.docentes.map(d => [d.inicio_semana, d.usos, d.alumnos]),
        theme: 'striped',
        headStyles: { fillColor: [83, 74, 183], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 },
      });
      cursorY = doc.lastAutoTable.finalY + 10;
    }

    // ── ✅ EVENTOS ESPECIALES ──
    if (datos.eventos.length > 0) {
      doc.addPage();
      cursorY = 15;

      // Encabezado de sección con color naranja
      doc.setFillColor(186, 117, 23);
      doc.rect(0, 0, pageW, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Eventos Especiales', pageW / 2, 12, { align: 'center' });
      cursorY = 26;

      doc.setTextColor(30, 30, 30);
      autoTable(doc, {
        startY: cursorY,
        head: [['Laboratorio', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Descripción']],
        body: datos.eventos.map(e => [
          e.laboratorio ?? '—',
          formatearFecha(e.fecha),
          String(e.hora_inicio ?? '').slice(0, 5),
          String(e.hora_fin ?? '').slice(0, 5),
          e.descripcion ?? '—',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [186, 117, 23], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [255, 248, 235] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 28 },
          2: { cellWidth: 24 },
          3: { cellWidth: 24 },
          4: { cellWidth: 'auto' },
        },
        margin: { left: 14, right: 14 },
      });
      cursorY = doc.lastAutoTable.finalY + 10;
    }

    // ── Gráficas ──
    if (graficasRef.current) {
      doc.addPage();
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text('Gráficas', 14, 14);

      const canvas = await html2canvas(graficasRef.current, { scale: 1.5, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const imgH = (canvas.height * (pageW - 28)) / canvas.width;
      doc.addImage(imgData, 'PNG', 14, 22, pageW - 28, imgH);
    }

    // ── Pie de página ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${totalPages}  |  Generado el ${new Date().toLocaleDateString('es-MX')}`,
        pageW / 2, doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }

    doc.save(`reporte_semestre_${filtros.fecha_inicio || 'all'}_${filtros.fecha_fin || 'all'}.pdf`);
    setExportando(false);
  };

  return (
    <div className="reportes-page">
      <h1>Reportes del Semestre</h1>

      {/* ── Filtros de fecha ── */}
      <div className="filtros-panel">
        <label>
          Fecha inicio
          <input
            type="date"
            value={filtros.fecha_inicio}
            onChange={e => setFiltros(p => ({ ...p, fecha_inicio: e.target.value }))}
          />
        </label>
        <label>
          Fecha fin
          <input
            type="date"
            value={filtros.fecha_fin}
            onChange={e => setFiltros(p => ({ ...p, fecha_fin: e.target.value }))}
          />
        </label>
        <button className="btn-generar" onClick={generarReportes}>
          Generar Reportes
        </button>

        {generado && (
          <button className="btn-exportar" onClick={exportarPDF} disabled={exportando}>
            {exportando ? 'Generando PDF...' : '⬇ Exportar PDF'}
          </button>
        )}
      </div>

      {generado && (
        <>
          {/* ── Tarjetas de resumen ── */}
          <div className="metricas-grid">
            <div className="metrica-card"><p>Total prácticas</p><p>{datos.resumen?.total_practicas}</p></div>
            <div className="metrica-card"><p>Total alumnos</p><p>{datos.resumen?.total_alumnos}</p></div>
            <div className="metrica-card"><p>Docentes activos</p><p>{datos.resumen?.docentes_activos}</p></div>
            <div className="metrica-card"><p>Laboratorios</p><p>{datos.resumen?.labs_usados}</p></div>
            {/* ✅ Nueva tarjeta de eventos */}
            <div className="metrica-card"><p>Eventos especiales</p><p>{datos.eventos.length}</p></div>
          </div>

          {/* ── ✅ Tabla de eventos especiales en pantalla ── */}
          {datos.eventos.length > 0 && (
            <div className="grafica-card" style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#BA7517', marginBottom: '12px' }}>Eventos Especiales</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#BA7517', color: '#fff' }}>
                      {['Laboratorio', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Descripción'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datos.eventos.map((e, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0e6d3', background: i % 2 === 0 ? '#fff' : '#fff8eb' }}>
                        <td style={{ padding: '10px 12px', color: '#344054' }}>{e.laboratorio}</td>
                        <td style={{ padding: '10px 12px', color: '#344054' }}>{formatearFecha(e.fecha)}</td>
                        <td style={{ padding: '10px 12px', color: '#344054' }}>{String(e.hora_inicio ?? '').slice(0, 5)}</td>
                        <td style={{ padding: '10px 12px', color: '#344054' }}>{String(e.hora_fin ?? '').slice(0, 5)}</td>
                        <td style={{ padding: '10px 12px', color: '#344054' }}>{e.descripcion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Gráficas ── */}
          <div ref={graficasRef}>
            <div className="grafica-card">
              <h3>Uso por Laboratorio</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datos.labs}>
                  <XAxis dataKey="laboratorio" /><YAxis /><Tooltip /><Legend />
                  <Bar dataKey="total_usos"    name="Sesiones" fill="#0F6E56" />
                  <Bar dataKey="total_alumnos" name="Alumnos"  fill="#BA7517" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grafica-card">
              <h3>Distribución por Tipo de Práctica</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datos.tipos}
                    dataKey="total"
                    nameKey="tipo"
                    cx="50%" cy="50%"
                    outerRadius={110}
                    label={({ tipo, percent }) => `${tipo} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {datos.tipos.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grafica-card">
              <h3>Actividad Semanal por Docente</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datos.docentes}>
                  <XAxis dataKey="inicio_semana" /><YAxis /><Tooltip /><Legend />
                  <Line type="monotone" dataKey="usos"    name="Sesiones" stroke="#185FA5" />
                  <Line type="monotone" dataKey="alumnos" name="Alumnos"  stroke="#BA7517" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}