import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3007/api';

export default function LoginAdminPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    usuario: '',
    password: ''
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [accesoConcedido, setAccesoConcedido] = useState(false);
  const [sacudir, setSacudir] = useState(false);

  const dispararError = (msg) => {
    setError(msg);
    setSacudir(true);
    setTimeout(() => setSacudir(false), 500);
  };

  const handleLogin = async () => {
    setCargando(true);
    setError('');

    // ACCESO DIRECTO PARA DISEÑO: Entra directamente con las credenciales maestras
    if (form.usuario.trim().toLowerCase() === 'admin' && form.password === 'itsh2025') {
      setAccesoConcedido(true);
      setTimeout(() => {
        login('dev_session_token_2025');
        navigate('/admin/reportes');
      }, 600);
      return;
    }

    try {
      const response = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: form.usuario.trim(), // Limpia espacios
          password: form.password
        })
      });

      if (response.ok) {
        const res = await response.json();
        setAccesoConcedido(true);
        setTimeout(() => {
          login(res.token);
          navigate('/admin/reportes');
        }, 600);
      } else {
        const resError = await response.json();
        dispararError(resError.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      console.warn('Servidor no detectado. Intentando validacion local (puro localhost)...');

      // Limpiamos los datos para evitar errores de espacios o mayúsculas en el modo local
      const userLocal = form.usuario.trim().toLowerCase();
      const passLocal = form.password.trim();

      // Fallback Local: Si el backend falla, permitimos entrar si los datos son correctos
      if (userLocal === 'admin' && passLocal === 'itsh2025') {
        setAccesoConcedido(true);
        setTimeout(() => {
          login('token_local_itsh2025');
          navigate('/admin/reportes');
        }, 600);
      } else {
        dispararError('Error: Servidor no disponible y los datos ingresados no son válidos para el acceso de emergencia.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: error
      ? '2px solid #ff8c42'
      : '2px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: '0.25s ease',
    backdropFilter: 'blur(8px)'
  };

  return (
<div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(circle at center, #0a192f 0%, #000814 100%)', // Azul medianoche profundo
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: "'Segoe UI', Roboto, sans-serif"
      }}
    >
      <style>
        {`
          @keyframes reveal {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes successPulse {
            0% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.02); filter: brightness(1.2); border-color: #E8971A; }
            100% { transform: scale(1); opacity: 0; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
          }
          .animate-entrance { animation: reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-access { animation: successPulse 0.6s ease-in-out forwards; }
          .animate-shake { animation: shake 0.4s ease-in-out; }
          
          input:focus { 
            border-color: #E8971A !important; 
            box-shadow: 0 0 0 4px rgba(232, 151, 26, 0.15) !important;
          }
        `}
      </style>
      <div
        className={`animate-entrance ${accesoConcedido ? 'animate-access' : ''} ${sacudir ? 'animate-shake' : ''}`}
        style={{
          width: '100%',
          maxWidth: '430px',
          borderRadius: '28px',
          padding: '45px 38px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <img
            src="/logo-tecnm.png"
            alt="TecNM"
            height="72"
            style={{
              marginBottom: '18px',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))'
            }}
          />

          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}
          >
            Administración
          </h1>

          <p
            style={{
              marginTop: '10px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.5'
            }}
          >
            Instituto Tecnológico Superior de Huauchinango
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid #ef4444',
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '22px',
              color: '#fca5a5',
              fontSize: '13px'
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.8)',
              letterSpacing: '1px'
            }}
          >
            USUARIO
          </label>

          <input
            type="text"
            placeholder="Ingrese su usuario"
            value={form.usuario}
            onChange={e =>
              setForm(p => ({
                ...p,
                usuario: e.target.value
              }))
            }
            onKeyDown={handleKey}
            style={{
              ...inputStyle,
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              backdropFilter: 'none',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.8)',
              letterSpacing: '1px'
            }}
          >
            CONTRASEÑA
          </label>

          <div style={{ position: 'relative' }}>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              placeholder="Ingrese su contraseña"
              value={form.password}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  password: e.target.value
                }))
              }
              onKeyDown={handleKey}
              style={{
                ...inputStyle,
                paddingRight: '52px',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                backdropFilter: 'none',
                transition: 'all 0.3s ease'
              }}
            />

            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#E8971A', // Naranja Institucional
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {mostrarPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={cargando}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #1B396A 0%, #1e3a8a 100%)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '700',
            cursor: cargando ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          {cargando ? 'Verificando...' : 'Iniciar Sesión'}
        </button>

        <div
          style={{
            marginTop: '30px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#B38E5D', // Dorado TecNM
            fontWeight: '600'
          }}
        >
          Sistema Administrativo Institucional
        </div>
      </div>
    </div>
  );
}
 