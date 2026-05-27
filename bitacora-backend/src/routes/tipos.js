  const express = require('express');
  const router = express.Router();
  const db = require('../config/db');

  router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM tipos');
    res.json(rows);
  });

  module.exports = router;