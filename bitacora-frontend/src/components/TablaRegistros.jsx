import { useState, useEffect } from 'react';
import { getEventos, getRegistros } from '../api/api';

const styles = {
  wrapper: { fontFamily: "'Segoe UI', sans-serif", width: "100%" },
  titleBar: { background: "#E8971A", color: "#fff", fontSize: "20px", fontWeight: "700", padding: "14px 20px", letterSpacing: "1px", borderRadius: "6px 6px 0 0" },
  tableContainer: { overflowX: "auto", border: "1px solid #dde2ef", borderTop: "none", borderRadius: "0 0 6px 6px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "11.5px" },
  thead: { background: "#1a2540", color: "#fff" },
  th: { padding: "9px 7px", textAlign: "center", fontWeight: "600", fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.4px", border: "1px solid #2a3560", whiteSpace: "nowrap" },
  td: { padding: "10px 7px", textAlign: "center", border: "1px solid #dde2ef", fontSize: "11px", verticalAlign: "middle" },
  tdLeft: { padding: "10px 7px", textAlign: "left", border: "1px solid #dde2ef", fontSize: "11px", verticalAlign: "middle" },
  empty: { padding: "20px", textAlign: "center", color: "#b0b8c9", fontStyle: "italic" },
  badgeRegistro: { display: "inline-block", padding: "4px 8px", borderRadius: "999px", background: "#e8f1ff", color: "#185FA5", fontWeight: "700" },
  badgeEvento: { display: "inline-block", padding: "4px 8px", borderRadius: "999px", background: "#fff3df", color: "#BA7517", fontWeight: "700" },
};

const normalizarFecha = (fecha) => String(fecha || '').split('T')[0];
const normalizarHora = (hora) => String(hora || '').slice(0, 5);

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' });
};

const ordenarPorFechaYHora = (a, b) =>
  `${normalizarFecha(a.fecha)} ${normalizarHora(a.hora_entrada)}`.localeCompare(
    `${normalizarFecha(b.fecha)} ${normalizarHora(b.hora_entrada)}`
  );

const adaptarEventoARegistro = (evento) => ({
  ...evento,
  id_registro: `evento-${evento.id_evento ?? evento.id_evento_especial ?? `${evento.id_laboratorio}-${evento.fecha}-${evento.hora_inicio}`}`,
  esEventoEspecial: true,
  docente: 'EVENTO ESPECIAL',
  carrera: evento.descripcion,
  materia: '-',
  tipo_practica: 'Evento',
  unidad: '-',
  registrada_en_id: null, // ✅ null para eventos = muestra '-'
  alumnos_atendidos: '-',
  hora_entrada: evento.hora_inicio,
  hora_salida: evento.hora_fin,
  laboratorio: evento.laboratorio,
});

export default function TablaRegistros({ refresh }) {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    Promise.all([getRegistros(), getEventos()])
      .then(([registrosData, eventosData]) => {
        const registrosNormalizados = Array.isArray(registrosData) ? registrosData : [];
        const eventosNormalizados = Array.isArray(eventosData)
          ? eventosData.map(adaptarEventoARegistro)
          : [];

        setRegistros(
          [...registrosNormalizados, ...eventosNormalizados].sort(ordenarPorFechaYHora)
        );
      })
      .catch(() => setRegistros([]));
  }, [refresh]);

  // ✅ Función para mostrar el valor correcto de "Registrada en ID"
  const mostrarRegistradaID = (r) => {
    if (r.esEventoEspecial) return '-';
    return r.registrada_en_id ? 'SI' : 'NO';
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.titleBar}>REGISTROS DEL DIA</div>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Carrera</th>
              <th style={styles.th}>Materia</th>
              <th style={styles.th}>Practica</th>
              <th style={styles.th}>Unidad</th>
              <th style={styles.th}>Registrada en ID?</th>
              <th style={styles.th}>Alumnos Atendidos</th>
              <th style={styles.th}>Hora Entrada</th>
              <th style={styles.th}>Hora Salida</th>
              <th style={styles.th}>Laboratorio</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr><td colSpan={12} style={styles.empty}>No hay registros del dia</td></tr>
            ) : (
              registros.map(r => (
                <tr key={r.id_registro}>
                  <td style={styles.td}>{formatearFecha(r.fecha)}</td>
                  <td style={styles.td}>
                    <span style={r.esEventoEspecial ? styles.badgeEvento : styles.badgeRegistro}>
                      {r.esEventoEspecial ? 'Evento' : 'Registro'}
                    </span>
                  </td>
                  <td style={styles.tdLeft}>{r.docente}</td>
                  <td style={styles.tdLeft}>{r.carrera}</td>
                  <td style={styles.tdLeft}>{r.materia}</td>
                  <td style={styles.td}>{r.tipo_practica}</td>
                  <td style={styles.td}>{r.unidad}</td>
                  {/* ✅ CORRECCIÓN: usa registrada_en_id y maneja eventos */}
                  <td style={styles.td}>{mostrarRegistradaID(r)}</td>
                  <td style={styles.td}>{r.alumnos_atendidos}</td>
                  <td style={styles.td}>{normalizarHora(r.hora_entrada)}</td>
                  <td style={styles.td}>{normalizarHora(r.hora_salida)}</td>
                  <td style={styles.td}>{r.laboratorio}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}