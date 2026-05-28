require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://bitacora-itsh.vercel.app',
    process.env.FRONTEND_URL
  ]
}));
app.use(express.json());

app.use('/api/docentes',     require('./routes/docentes'));
app.use('/api/carreras',     require('./routes/carreras'));
app.use('/api/laboratorios', require('./routes/laboratorios'));
app.use('/api/tipos',        require('./routes/tipos'));
app.use('/api/registros',    require('./routes/registros'));
app.use('/api/reportes',     require('./routes/reportes'));
app.use('/api/eventos',      require('./routes/eventos'));
app.use('/api/auth',         require('./routes/auth'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: `Ruta no encontrada: ${req.path}` }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});