import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { pathname } = useLocation();
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .nav-item-animate { 
            animation: slideIn 0.4s ease-out forwards; 
            opacity: 0;
          }
        `}
      </style>
  <nav
    className="navbar"
    style={{
      width: '100%',
        padding: '16px 34px',
      boxSizing: 'border-box',
        background: 'rgb(0, 19, 46)', // Azul profundo sólido
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '18px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      fontFamily: 'Segoe UI'
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        color: '#fff'
      }}
    >
      <img
        src="/logo-tecnm.png"
        alt="TecNM"
        height="42"
        style={{
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))'
        }}
      />

      <div>
        <strong
          style={{
            fontSize: '15px',
            letterSpacing: '.3px',
            fontWeight: '700'
          }}
        >
          Instituto Tecnológico Superior de Huauchinango · TecNM
        </strong>
      </div>
    </div>

    <ul
      className="navbar-links"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        flexWrap: 'wrap'
      }}
    >
      <li className="nav-item-animate" style={{ animationDelay: '0.1s' }}>
        <Link
          to="/"
          className={pathname === '/' ? 'activo' : ''}
          style={{
            padding: '11px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            background:
              pathname === '/'
                ? 'rgba(232, 151, 26, 0.1)'
                : 'transparent',
            border:
              pathname === '/'
                ? '1px solid rgba(232, 151, 26, 0.4)'
                : '1px solid transparent',
            borderBottom: pathname === '/' ? '2px solid #E8971A' : '1px solid transparent',
            transition: '.25s ease'
          }}
        >
          Nuevo Registro
        </Link>
      </li>

      <li className="nav-item-animate" style={{ animationDelay: '0.2s' }}>
        <Link
          to="/registros"
          className={pathname === '/registros' ? 'activo' : ''}
          style={{
            padding: '11px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            background:
              pathname === '/registros'
                ? 'rgba(232, 151, 26, 0.1)'
                : 'transparent',
            border:
              pathname === '/registros'
                ? '1px solid rgba(232, 151, 26, 0.4)'
                : '1px solid transparent',
            borderBottom: pathname === '/registros' ? '2px solid #E8971A' : '1px solid transparent',
            transition: '.25s ease'
          }}
        >
          Registros del Día
        </Link>
      </li>

      {!isAdmin ? (
        <li className="nav-item-animate" style={{ animationDelay: '0.3s' }}>
          <Link
            to="/admin/login"
            className="btn-admin-nav"
            style={{
              padding: '11px 20px',
              borderRadius: '14px',
              textDecoration: 'none',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '700',
              background: 'linear-gradient(135deg,#E8971A 0%,#ffb347 100%)',
              boxShadow: '0 8px 20px rgba(26, 74, 232, 0.28)',
              transition: '.25s ease'
            }}
          >
            Administración
          </Link>
        </li>
      ) : (
        <>
          <li className="nav-item-animate" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/admin/qr"
              className={pathname === '/admin/qr' ? 'activo' : ''}
              style={{
                padding: '11px 18px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                background:
                  pathname === '/admin/qr'
                    ? 'rgba(232, 151, 26, 0.1)'
                    : 'transparent',
                border: '1px solid transparent',
                borderBottom: pathname === '/admin/qr' ? '2px solid #E8971A' : '1px solid transparent'
              }}
            >
              QR Docentes
            </Link>
          </li>

          <li className="nav-item-animate" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/admin/reportes"
              className={pathname === '/admin/reportes' ? 'activo' : ''}
              style={{
                padding: '11px 18px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                background:
                  pathname === '/admin/reportes'
                    ? 'rgba(232, 151, 26, 0.1)'
                    : 'transparent',
                border: '1px solid transparent',
                borderBottom: pathname === '/admin/reportes' ? '2px solid #E8971A' : '1px solid transparent'
              }}
            >
              Informes
            </Link>
          </li>

          <li className="nav-item-animate" style={{ animationDelay: '0.6s' }}>
            <Link
              to="/admin/eventos"
              className={pathname === '/admin/eventos' ? 'activo' : ''}
              style={{
                padding: '11px 18px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                background:
                  pathname === '/admin/eventos'
                    ? 'rgba(232, 151, 26, 0.1)'
                    : 'transparent',
                border: '1px solid transparent',
                borderBottom: pathname === '/admin/eventos' ? '2px solid #E8971A' : '1px solid transparent'
              }}
            >
              Eventos Especiales
            </Link>
          </li>

          <li className="nav-item-animate" style={{ animationDelay: '0.7s' }}>
            <button
              className="btn-logout-nav"
              onClick={handleLogout}
              style={{
                border: 'none',
                padding: '11px 18px',
                borderRadius: '14px',
              background: 'linear-gradient(135deg,#c62828 0%,#ef5350 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(198, 40, 40, 0.3)'
              }}
            >
              Cerrar sesión
            </button>
          </li>
        </>
      )}
    </ul>
  </nav>
  </>
);
}