const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const SECRET = process.env.QR_SECRET || 'itsh_secreto';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'itsh2025';

router.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  if (usuario !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign({ rol: 'admin' }, SECRET, { expiresIn: '8h' });
  res.json({ token });
});

module.exports = router;