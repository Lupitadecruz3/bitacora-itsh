const express = require('express');
const router = express.Router();
const db = require('../config/db');

const asegurarColumnaQR = async () => {
  const [columns] = await db.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'docente'
      AND COLUMN_NAME = 'qr_token'
  `);

  if (columns.length === 0) {
    await db.query('ALTER TABLE docente ADD COLUMN qr_token VARCHAR(100) NULL UNIQUE');
  }
};

router.get('/', async (req, res) => {
  try {
    await asegurarColumnaQR();
    const [rows] = await db.query('SELECT * FROM docente');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/generar-qr', async (req, res) => {
  try {
    const { id } = req.params;
    await asegurarColumnaQR();

    const [rows] = await db.query(
      'SELECT qr_token FROM docente WHERE id_docente = ?', [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    if (rows[0]?.qr_token) {
      return res.json({ token: rows[0].qr_token });
    }

    const token = `ITSH-DOCENTE-${id}`;

    await db.query(
      'UPDATE docente SET qr_token = ? WHERE id_docente = ?',
      [token, id]
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/validar-qr', async (req, res) => {
  try {
    const { token, id_docente } = req.body;
    await asegurarColumnaQR();

    const [rows] = await db.query(
      'SELECT id_docente FROM docente WHERE qr_token = ?', [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        valido: false,
        error: 'QR inválido o no registrado'
      });
    }

    if (rows[0].id_docente !== parseInt(id_docente)) {
      return res.status(403).json({
        valido: false,
        error: 'El QR no corresponde al docente seleccionado'
      });
    }

    res.json({ valido: true });
  } catch (e) {
    res.status(500).json({ valido: false, error: e.message });
  }
});

module.exports = router;
