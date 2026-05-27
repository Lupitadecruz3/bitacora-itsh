import { useState, useEffect } from 'react';
import QRScanner from './QRScanner';
import {
  getCarreras, getMaterias, getDocentesByCarrera,
  getLaboratorios, getTipos, getEventos, verificarLaboratorioOcupado,
  crearRegistro, validarQRDocente
} from '../api/api';

const MENSAJE_LAB_OCUPADO = 'Laboratorio en uso, selecciona otro';

const normalizarFecha = (fecha) => String(fecha || '').split('T')[0];
const normalizarHora = (hora) => String(hora || '').slice(0, 5);

const seCruzanHorarios = (inicioA, finA, inicioB, finB) =>
  inicioA < finB && finA > inicioB;

const reproducirVozRespaldo = (onFinalizar) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const aviso = new SpeechSynthesisUtterance(MENSAJE_LAB_OCUPADO);
    aviso.lang = 'es-MX';
    aviso.onend = onFinalizar;
    aviso.onerror = onFinalizar;
    window.speechSynthesis.speak(aviso);
  } else {
    onFinalizar();
  }
};

const avisarLaboratorioOcupado = () => {
  const audio = new Audio('../dist/audio/laboratorio-ocupado.wav');
  const mostrarMensaje = () => alert(MENSAJE_LAB_OCUPADO);

  audio.onended = mostrarMensaje;
  audio.onerror = () => reproducirVozRespaldo(mostrarMensaje);

  audio.play().catch(() => {
    reproducirVozRespaldo(mostrarMensaje);
  });
};

export default function FormRegistro({ onGuardado }) {
  const [mostrarScanner, setMostrarScanner] = useState(false);
  const hoy = new Date().toISOString().split('T')[0];

  const [docentes, setDocentes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [tipos, setTipos] = useState([]);

  const [form, setForm] = useState({
    fecha: hoy,
    id_docente: '',
    id_carrera: '',
    id_materia: '',
    tipo_practica_id_tipo: '',
    numero_unidad: '',
    registrada_en_id: 0,
    alumnos_atendidos: '',
    hora_entrada: '',
    hora_salida: '',
    id_laboratorio: '',
  });

  useEffect(() => {
    getCarreras().then(setCarreras);
    getLaboratorios().then(setLaboratorios);
    getEventos().then(setEventos);
    getTipos().then(setTipos);
  }, []);

  useEffect(() => {
    if (form.id_carrera) {
      getMaterias(form.id_carrera).then(setMaterias);
      getDocentesByCarrera(form.id_carrera).then(setDocentes);
    }
  }, [form.id_carrera]);

  const buscarEventoOcupado = (datos) => {
    const { id_laboratorio, fecha, hora_entrada, hora_salida } = datos;

    if (!id_laboratorio || !fecha || !hora_entrada || !hora_salida) {
      return null;
    }

    return eventos.find(evento =>
      String(evento.id_laboratorio) === String(id_laboratorio) &&
      normalizarFecha(evento.fecha) === normalizarFecha(fecha) &&
      seCruzanHorarios(
        normalizarHora(hora_entrada),
        normalizarHora(hora_salida),
        normalizarHora(evento.hora_inicio),
        normalizarHora(evento.hora_fin)
      )
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let nextValue;
    if (name === 'registrada_en_id') {
      nextValue = Number(value);
    } else if (type === 'checkbox') {
      nextValue = checked;
    } else {
      nextValue = value;
    }

    if (name === 'id_carrera') {
      if (!value) {
        setMaterias([]);
        setDocentes([]);
      }
      setForm(prev => ({ ...prev, [name]: nextValue, id_materia: '', id_docente: '' }));
    } else {
      const nextForm = { ...form, [name]: nextValue };

      if (buscarEventoOcupado(nextForm)) {
        avisarLaboratorioOcupado();
        setForm({ ...nextForm, id_laboratorio: '' });
        return;
      }

      setForm(nextForm);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.id_carrera ||
      !form.id_materia ||
      !form.id_docente ||
      !form.id_laboratorio ||
      !form.hora_entrada ||
      !form.hora_salida
    ) {
      alert("Por favor, completa los campos obligatorios");
      return;
    }

    const disponibilidad = await verificarLaboratorioOcupado(form);

    if (disponibilidad.ocupado) {
      avisarLaboratorioOcupado();
      setForm(prev => ({ ...prev, id_laboratorio: '' }));
      return;
    }

    setMostrarScanner(true);
  };

  const onQRScaneado = async (token, callback) => {
    const validacion = await validarQRDocente(token, form.id_docente);

    if (!validacion.valido) {
      callback(false, validacion.error || 'QR no corresponde al docente seleccionado');
      return;
    }

    const res = await crearRegistro(form);

    if (res.error) {
      if (res.error.toLowerCase().includes('laboratorio ocupado')) {
        avisarLaboratorioOcupado();
      }

      callback(false, res.error);
      return;
    }

    if (res.id_registro) {
      callback(true, 'Registro guardado correctamente');
      onGuardado?.();
      setMostrarScanner(false);
      setForm({
        fecha: hoy,
        id_docente: '',
        id_carrera: '',
        id_materia: '',
        tipo_practica_id_tipo: '',
        numero_unidad: '',
        registrada_en_id: 0,
        alumnos_atendidos: '',
        hora_entrada: '',
        hora_salida: '',
        id_laboratorio: '',
      });
    }
  };

  return (
    <div
      className="form-card"
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 18px 45px rgba(0,0,0,0.18)',
        fontFamily: "'Segoe UI', sans-serif"
      }}
    >
      <header
        className="form-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '22px 28px',
          background: 'linear-gradient(135deg,#0F2942 0%, #023b98 78%, #f96d01 100.25%)',
          color: '#fff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.99)'
        }}
      >
        <img src="/logo-tecnm.png" alt="TecNM" height="40" />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '.4px'
            }}
          >
            Instituto Tecnológico Superior de Huauchinango · TecNM
          </h1>
        </div>
      </header>

      <div
        className="form-body"
        style={{
          padding: '28px',
          background: '#ffffff'
        }}
      >
        {/* Fila 1: Fecha + Docente */}
        <div
          className="form-row"
          style={{
            display: 'flex',
            gap: '18px',
            marginBottom: '22px',
            flexWrap: 'wrap'
          }}
        >
          <label
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054',
              letterSpacing: '.5px'
            }}
          >
            FECHA
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </label>

          <label
            className="wide"
            style={{
              flex: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054',
              letterSpacing: '.5px'
            }}
          >
            NOMBRE DEL (LA) DOCENTE
            <select
              name="id_docente"
              value={form.id_docente}
              onChange={handleChange}
              disabled={!form.id_carrera}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="">
                {form.id_carrera ? "Selecciona un docente" : "Primero selecciona carrera"}
              </option>
              {docentes.map(d => (
                <option key={d.id_docente} value={d.id_docente}>
                  Ing. {d.nombre} {d.apellido}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Fila 2: Carrera + Materia */}
        <div
          className="form-row"
          style={{
            display: 'flex',
            gap: '18px',
            marginBottom: '22px',
            flexWrap: 'wrap'
          }}
        >
          <label
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054'
            }}
          >
            CARRERA
            <select
              name="id_carrera"
              value={form.id_carrera}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828'
              }}
            >
              <option value="">Selecciona una carrera</option>
              {carreras.map(c => (
                <option key={c.id_carrera} value={c.id_carrera}>
                  {c.nombre_carrera}
                </option>
              ))}
            </select>
          </label>

          <label
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054'
            }}
          >
            MATERIA
            <select
              name="id_materia"
              value={form.id_materia}
              onChange={handleChange}
              disabled={!form.id_carrera}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828'
              }}
            >
              <option value="">
                {form.id_carrera ? "Selecciona una materia" : "Primero selecciona carrera"}
              </option>
              {materias.map(m => (
                <option key={m.id_materia} value={m.id_materia}>
                  {m.nombre_materia}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Fila 3: Práctica + Unidad + Registrada en ID */}
        <div
          className="form-row"
          style={{
            display: 'flex',
            gap: '18px',
            marginBottom: '22px',
            flexWrap: 'wrap'
          }}
        >
          <label
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054'
            }}
          >
            PRÁCTICA A REALIZAR
            <select
              name="tipo_practica_id_tipo"
              value={form.tipo_practica_id_tipo}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828'
              }}
            >
              <option value="">Seleccionar</option>
              {tipos.map(t => (
                <option key={t.id_tipo} value={t.id_tipo}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </label>

          <label
            className="short"
            style={{
              width: '120px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054'
            }}
          >
            UNIDAD
            <select
              name="numero_unidad"
              value={form.numero_unidad}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828'
              }}
            >
              <option value="">Seleccionar</option>
              <option value="1">Unidad 1</option>
              <option value="2">Unidad 2</option>
              <option value="3">Unidad 3</option>
              <option value="4">Unidad 4</option>
              <option value="5">Unidad 5</option>
              <option value="5">Unidad 6</option>
              <option value="5">Unidad 7</option>
            </select>
          </label>

          <label
            className="short"
            style={{
              width: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054'
            }}
          >
            ¿REGISTRADA EN ID?
            <select
              name="registrada_en_id"
              value={form.registrada_en_id}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828'
              }}
            >
              <option value={0}>No</option>
              <option value={1}>Si</option>
            </select>
          </label>
        </div>

        {/* Fila 4 */}
        <div
          className="form-row"
          style={{
            display: 'flex',
            gap: '18px',
            marginBottom: '22px',
            flexWrap: 'wrap'
          }}
        >
          <label
            className="short"
            style={{
              width: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054'
            }}
          >
            ALUMNOS ATENDIDOS
            <input
              type="number"
              name="alumnos_atendidos"
              min="1"
              value={form.alumnos_atendidos}
              onChange={handleChange}
              placeholder="15"
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828'
              }}
            />
          </label>

          <label
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054'
            }}
          >
            HORA ENTRADA
            <input
              type="time"
              name="hora_entrada"
              value={form.hora_entrada}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828'
              }}
            />
          </label>

          <label
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054'
            }}
          >
            HORA SALIDA
            <input
              type="time"
              name="hora_salida"
              value={form.hora_salida}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828'
              }}
            />
          </label>

          <label
            className="short"
            style={{
              width: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#344054'
            }}
          >
            LABORATORIO
            <select
              name="id_laboratorio"
              value={form.id_laboratorio}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '14px',
                border: '2px solid #e4e7ec',
                background: '#fff',
                fontSize: '14px',
                color: '#101828'
              }}
            >
              <option value="">Selecciona Lab</option>
              {laboratorios.map(l => (
                <option key={l.id_laboratorio} value={l.id_laboratorio}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="form-actions"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '10px'
          }}
        >
          <button
            className="btn-guardar"
            onClick={handleSubmit}
            style={{
              border: 'none',
              padding: '14px 28px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg,#0F2942 0%,#174EA6 100%)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '.6px',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(3, 158, 255, 0.36)'
            }}
          >
            GUARDAR
          </button>
        </div>
      </div>

      {mostrarScanner && (
        <QRScanner
          onScaneado={onQRScaneado}
          onCancelar={() => setMostrarScanner(false)}
        />
      )}
    </div>
  );
}