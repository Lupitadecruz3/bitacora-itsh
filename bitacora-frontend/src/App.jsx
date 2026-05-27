import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar        from './components/Navbar';
import RutaAdmin     from './components/RutaAdmin';
import InicioPage    from './pages/InicioPage';
import RegistrosPage from './pages/RegistrosPage';
import ReportesPage  from './pages/ReportesPage';
import EventosPage   from './pages/EventosPage';
import QRAdminPage   from './pages/QRAdminPage';
import LoginAdminPage from './pages/LoginAdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/"          element={<InicioPage />} />
            <Route path="/registros" element={<RegistrosPage />} />

            {/* Login admin */}
            <Route path="/admin/login" element={<LoginAdminPage />} />

            {/* Rutas protegidas — solo admin */}
            <Route path="/admin/qr" element={
              <RutaAdmin><QRAdminPage /></RutaAdmin>
            }/>
            <Route path="/admin/dashboard" element={<Navigate to="/admin/reportes" replace />} />
            <Route path="/admin/reportes" element={
              <RutaAdmin><ReportesPage /></RutaAdmin>
            }/>
            <Route path="/admin/eventos" element={
              <RutaAdmin><EventosPage /></RutaAdmin>
            }/>
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}