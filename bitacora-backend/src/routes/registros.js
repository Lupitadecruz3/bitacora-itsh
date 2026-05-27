const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  let query = 'SELECT * FROM vista_registros WHERE 1=1';
  let params = [];

  if (fecha_inicio && fecha_fin) {
    query += ' AND fecha BETWEEN ? AND ?';
    params.push(fecha_inicio, fecha_fin);
  }

  query += ' ORDER BY fecha ASC, id_registro ASC';

  const [rows] = await db.query(query, params);
  res.json(rows);
});

const buscarLaboratorioOcupado = async ({ id_laboratorio, fecha, hora_entrada, hora_salida }) => {
  const [eventos] = await db.query(
    `SELECT 'evento' AS tipo, descripcion AS detalle
     FROM eventos_especiales
     WHERE id_laboratorio = ?
       AND fecha = ?
       AND ? < hora_fin
       AND ? > hora_inicio
     LIMIT 1`,
    [id_laboratorio, fecha, hora_entrada, hora_salida]
  );

  if (eventos.length > 0) {
    return eventos[0];
  }

  const [registros] = await db.query(
    `SELECT 'registro' AS tipo, id_registro AS detalle
     FROM registro
     WHERE id_laboratorio = ?
       AND fecha = ?
       AND ? < hora_salida
       AND ? > hora_entrada
     LIMIT 1`,
    [id_laboratorio, fecha, hora_entrada, hora_salida]
  );

  return registros[0] || null;
};

router.get('/laboratorio-ocupado', async (req, res) => {
  try {
    const { id_laboratorio, fecha, hora_entrada, hora_salida } = req.query;

    if (!id_laboratorio || !fecha || !hora_entrada || !hora_salida) {
      return res.status(400).json({
        error: 'Faltan datos para revisar la disponibilidad del laboratorio'
      });
    }

    const ocupado = await buscarLaboratorioOcupado({
      id_laboratorio,
      fecha,
      hora_entrada,
      hora_salida
    });

    res.json({ ocupado: !!ocupado, tipo: ocupado?.tipo || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const ocupado = await buscarLaboratorioOcupado(data);

    if (ocupado) {
      return res.status(400).json({
        error: 'Laboratorio ocupado'
      });
    }

    const [result] = await db.query(
      `INSERT INTO registro 
      (fecha, id_docente, id_materia, tipo_practica_id_tipo,
      numero_unidad, registrada_en_id, alumnos_atendidos,
      hora_entrada, hora_salida, id_laboratorio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.fecha,
        data.id_docente,
        data.id_materia,
        data.tipo_practica_id_tipo,
        data.numero_unidad,
        data.registrada_en_id,
        data.alumnos_atendidos,
        data.hora_entrada,
        data.hora_salida,
        data.id_laboratorio,
      ]
    );

    res.json({ id_registro: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
