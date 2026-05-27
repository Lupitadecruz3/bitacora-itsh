const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  let where = '';
  const params = [];

  if (fecha_inicio && fecha_fin) {
    where = 'WHERE e.fecha BETWEEN ? AND ?';
    params.push(fecha_inicio, fecha_fin);
  } else if (fecha_inicio) {
    where = 'WHERE e.fecha >= ?';
    params.push(fecha_inicio);
  } else if (fecha_fin) {
    where = 'WHERE e.fecha <= ?';
    params.push(fecha_fin);
  }

  const [rows] = await db.query(`
    SELECT e.*, l.nombre laboratorio
    FROM eventos_especiales e
    JOIN laboratorio l ON e.id_laboratorio = l.id_laboratorio
    ${where}
    ORDER BY e.fecha ASC, e.hora_inicio ASC
  `, params);

  res.json(rows);
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;

    if (!data.id_laboratorio || !data.fecha || !data.hora_inicio || !data.hora_fin) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar conflicto con otros eventos
    const [conflictosEventos] = await db.query(`
      SELECT id_evento FROM eventos_especiales
      WHERE id_laboratorio = ?
        AND fecha = ?
        AND hora_inicio < ?
        AND hora_fin > ?
    `, [data.id_laboratorio, data.fecha, data.hora_fin, data.hora_inicio]);

    if (conflictosEventos.length > 0) {
      return res.status(409).json({ error: 'Laboratorio en uso, selecciona otro' });
    }

    // Verificar conflicto con registros normales
    const [conflictosRegistros] = await db.query(`
      SELECT id_registro FROM registro
      WHERE id_laboratorio = ?
        AND fecha = ?
        AND hora_entrada < ?
        AND hora_salida > ?
    `, [data.id_laboratorio, data.fecha, data.hora_fin, data.hora_inicio]);

    if (conflictosRegistros.length > 0) {
      return res.status(409).json({ error: 'Laboratorio en uso, selecciona otro' });
    }

    await db.query(`
      INSERT INTO eventos_especiales
      (id_laboratorio, fecha, hora_inicio, hora_fin, descripcion)
      VALUES (?, ?, ?, ?, ?)
    `, [
      data.id_laboratorio,
      data.fecha,
      data.hora_inicio,
      data.hora_fin,
      data.descripcion,
    ]);

    res.json({ ok: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;