import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScaneado, onCancelar }) {
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const scannerRef = useRef(null);
  const yaEscaneado = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 5,
        qrbox: { width: 250, height: 250 },
      },
      async (token) => {
        if (yaEscaneado.current) return;
        yaEscaneado.current = true;

        try {
          await scanner.stop();
        } catch {
          console.warn('No se pudo detener el scanner despues de leer el QR');
        }

        onScaneado(token, (exito, msg) => {
          setResultado(exito ? 'exito' : 'error');
          setMensaje(msg);
        });
      },
      undefined
    ).catch(err => console.log(err));

    return () => {
      try {
        scannerRef.current?.stop();
      } catch {
        console.warn('No se pudo detener el scanner al cerrar');
      }
    };
  }, [onScaneado]);

  if (resultado) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        background: resultado === 'exito'
          ? 'rgba(15, 110, 86, 0.97)'
          : 'rgba(180, 0, 0, 0.97)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}>
        <div style={{ textAlign: 'center', color: '#fff', padding: '40px' }}>
          <div style={{ fontSize: '120px', lineHeight: 1, marginBottom: '24px' }}>
            {resultado === 'exito' ? '✅' : '❌'}
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', margin: '0 0 12px' }}>
            {resultado === 'exito' ? 'ACCESO CORRECTO' : 'ACCESO DENEGADO'}
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px' }}>
            {mensaje}
          </p>
          <button
            onClick={onCancelar}
            style={{
              padding: '14px 48px',
              background: '#fff',
              color: resultado === 'exito' ? '#0F6E56' : '#cc0000',
              border: 'none', borderRadius: '50px',
              fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            }}
          >
            {resultado === 'exito' ? '✓ Aceptar' : '✕ Cerrar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '32px',
        width: '90%', maxWidth: '440px', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>📷</div>
        <h2 style={{ color: '#0F2942', margin: '0 0 4px', fontSize: '22px' }}>
          Escanea tu QR
        </h2>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
          El docente debe mostrar su tarjeta QR personal
        </p>
        <div id="qr-reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
        <button
          onClick={async () => {
            try {
              await scannerRef.current?.stop();
            } catch {
              console.warn('No se pudo detener el scanner al cancelar');
            }
            onCancelar();
          }}
          style={{
            marginTop: '20px', padding: '10px 32px',
            background: '#f5f5f5', color: '#666',
            border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          ✖ Cancelar
        </button>
      </div>
    </div>
  );
}
