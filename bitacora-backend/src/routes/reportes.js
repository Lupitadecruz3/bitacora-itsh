const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/resumen', async (req, res) => {
  const [rows] = await db.query(`
    SELECT 
      COUNT(*) total_practicas,
      SUM(alumnos_atendidos) total_alumnos,
      COUNT(DISTINCT id_docente) docentes_activos,
      COUNT(DISTINCT id_laboratorio) labs_usados
    FROM registro
  `);

  res.json(rows[0]);
});

router.get('/laboratorios', async (req, res) => {
  const [rows] = await db.query(`
    SELECT l.nombre laboratorio,
           COUNT(*) total_usos,
           SUM(r.alumnos_atendidos) total_alumnos
    FROM registro r
    JOIN laboratorio l ON r.id_laboratorio = l.id_laboratorio
    GROUP BY l.nombre
  `);

  res.json(rows);
});

router.get('/tipo-practica', async (req, res) => {
  const [rows] = await db.query(`
    SELECT t.nombre tipo,
           COUNT(*) total
    FROM registro r
    JOIN tipos t ON r.tipo_practica_id_tipo = t.id_tipo
    GROUP BY t.nombre
  `);

  res.json(rows);
});

router.get('/docentes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE(fecha) AS inicio_semana,
        COUNT(*) AS usos,
        SUM(alumnos_atendidos) AS alumnos
      FROM registro
      GROUP BY DATE(fecha)
      ORDER BY fecha ASC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;