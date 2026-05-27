import { useEffect, useState } from 'react';
import { getLaboratorios, crearEvento } from '../api/api';

export default function EventosPage() {

  const [laboratorios, setLaboratorios] = useState([]);

  const [form, setForm] = useState({
    id_laboratorio: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    descripcion: ''
  });

  useEffect(() => {
    getLaboratorios().then(setLaboratorios);
  }, []);

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const guardar = async () => {

    const res = await crearEvento(form);

    if (res.error) {
      alert(res.error);
      return;
    }

    alert('Evento registrado correctamente');

    setForm({
      id_laboratorio: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      descripcion: ''
    });
  };

  return (

    <div className="eventos-container">

      <div className="eventos-card">

        <h1>Eventos Especiales</h1>

        <div className="eventos-grid">

          <label>
            Laboratorio

            <select
              name="id_laboratorio"
              value={form.id_laboratorio}
              onChange={handleChange}
            >
              <option value="">Selecciona laboratorio</option>

              {laboratorios.map(l => (
                <option
                  key={l.id_laboratorio}
                  value={l.id_laboratorio}
                >
                  {l.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Fecha

            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
            />
          </label>

          <label>
            Hora Inicio

            <input
              type="time"
              name="hora_inicio"
              value={form.hora_inicio}
              onChange={handleChange}
            />
          </label>

          <label>
            Hora Fin

            <input
              type="time"
              name="hora_fin"
              value={form.hora_fin}
              onChange={handleChange}
            />
          </label>

          <label className="full">
            Descripción

            <input
              type="text"
              name="descripcion"
              placeholder="Descripción del evento"
              value={form.descripcion}
              onChange={handleChange}
            />
          </label>

        </div>

        <button
          className="btn-evento"
          onClick={guardar}
        >
          Guardar Evento
        </button>

      </div>

    </div>
  );
}