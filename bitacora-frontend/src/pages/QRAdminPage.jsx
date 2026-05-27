import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getDocentes, generarQRDocente } from '../api/api';

export default function QRAdminPage() {
  const [docentes, setDocentes] = useState([]);
  const [tokens, setTokens] = useState({});
  const [cargando, setCargando] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Al cargar, traer docentes con su qr_token existente
    getDocentes().then(data => {
      setDocentes(data);
      // Si ya tienen token guardado en BD, mostrarlo directo
      const existentes = {};
      data.forEach(d => {
        if (d.qr_token) existentes[d.id_docente] = d.qr_token;
      });
      setTokens(existentes);
    });
  }, []);

  const generarQR = async (id) => {
    try {
      setError('');
      setCargando(id);
      const res = await generarQRDocente(id);

      if (res.token) {
        setTokens(prev => ({ ...prev, [id]: res.token }));
      } else {
        setError('El servidor no devolvio el token del QR');
      }
    } catch (err) {
      setError(err.message || 'No se pudo generar el QR');
    } finally {
      setCargando(null);
    }
  };

  const imprimir = (docente) => {
    const svg = document.getElementById(`svg-${docente.id_docente}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <html>
        <body style="text-align:center;font-family:sans-serif;padding:40px;background:#f4f8ff">
          <img src="/logo-tecnm.png" height="70" style="margin-bottom:12px"/>
          <h2 style="color:#0F2942;margin:0">Instituto Tecnológico Superior de Huauchinango</h2>
          <p style="color:#555;margin:4px 0 20px">TecNM · Tarjeta de Acceso al Laboratorio</p>
          <div style="border:2px solid #2563eb;border-radius:18px;display:inline-block;padding:28px 36px;box-shadow:0 10px 25px rgba(0,0,0,0.1)">
            <p style="font-size:18px;font-weight:700;color:#0F2942;margin:0 0 16px">
              Ing. ${docente.nombre} ${docente.apellido}
            </p>
            <img src="${url}" width="200" height="200"/>
          </div>
          <p style="color:#cc0000;font-size:12px;margin-top:16px">
            ⚠ Código personal e intransferible — No compartir
          </p>
        </body>
      </html>
    `);
    ventana.document.close();
    setTimeout(() => ventana.print(), 500);
  };

  return (
    <div style={{
      padding: '40px 20px',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      background: 'radial-gradient(circle at center, #0a192f 0%, #000814 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <style>
        {`
          @keyframes qrPop {
            from { opacity: 0; transform: scale(0.8) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .qr-appear { animation: qrPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        `}
      </style>
      <div style={{ maxWidth: '1200px', width: '100%' }}>

      {/* HEADER */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px 34px',
        marginBottom: '35px',
        color: '#fff',
        borderBottom: '4px solid #E8971A', // Acento Naranja
        boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>
           Tarjetas QR de Docentes
        </h1>
        <p style={{ margin: '10px 0 0', opacity: 0.85, fontSize: '14px' }}>
          Sistema de acceso seguro con códigos QR únicos por docente
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fff1f2',
          border: '1px solid #fca5a5',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#b91c1c',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {error}
        </div>
      )}

      {/* GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        gap: '22px'
      }}>
        {docentes.map(d => (
          <div key={d.id_docente} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '18px',
            padding: '26px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            border: tokens[d.id_docente] ? '2px solid #E8971A' : '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            transition: '0.3s',
            backdropFilter: 'blur(12px)',
            color: '#fff'
          }}>

            <div style={{
              width: '55px',
              height: '55px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8971A, #ffb347)',
              color: '#fff', fontSize: '20px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 6px 15px rgba(232,151,26,0.3)'
            }}>
              {d.nombre.charAt(0)}
            </div>

            <h3 style={{
              margin: '0 0 16px',
              fontSize: '15px',
              fontWeight: '700',
              color: '#fff'
            }}>
              Ing. {d.nombre} {d.apellido}
            </h3>

            {tokens[d.id_docente] ? (
              <div className="qr-appear">
                <QRCodeSVG
                  id={`svg-${d.id_docente}`}
                  value={tokens[d.id_docente]}
                  size={160}
                  fgColor="#000814"
                  bgColor="#ffffff"
                  level="H"
                  style={{ borderRadius: '8px', padding: '10px', background: '#fff' }}
                />

                <p style={{
                  color: '#E8971A',
                  fontWeight: '600',
                  fontSize: '13px',
                  margin: '10px 0'
                }}>
                   QR activo
                </p>

                <button
                  onClick={() => imprimir(d)}
                  style={{
                    padding: '11px 24px',
                    background: 'linear-gradient(135deg, #1B396A, #1e3a8a)',
                    color: '#fff',
                    border: '1px solid #E8971A',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 6px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  🖨 Imprimir / Reimprimir
                </button>

                <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '8px' }}>
                  Código permanente e intransferible
                </p>
              </div>
            ) : (
              <>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>
                  Sin QR generado aún
                </p>

                <button
                  onClick={() => generarQR(d.id_docente)}
                  disabled={cargando === d.id_docente}
                  style={{
                    padding: '12px 24px',
                    background: cargando === d.id_docente
                      ? '#94a3b8'
                      : 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: cargando === d.id_docente ? 'not-allowed' : 'pointer',
                    width: '100%',
                    boxShadow: '0 6px 15px rgba(59,130,246,0.25)'
                  }}
                >
                  {cargando === d.id_docente ? 'Generando...' : '🔑 Generar QR'}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
