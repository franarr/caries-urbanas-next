'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, loginDemo } from '@/lib/api-admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(email.trim(), contrasena);
      router.push('/admin');
    } catch (err: any) {
      if (err.status === 401) {
        setErrorMsg('Credenciales incorrectas');
      } else if (err.status === 429) {
        setErrorMsg('Demasiados intentos, aguarde 15 minutos');
      } else {
        setErrorMsg(err.message || 'Error de conexión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    loginDemo('admin');
    router.push('/admin');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '36px 32px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h1
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: '20px',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.02em',
                marginBottom: '4px',
              }}
            >
              Ingreso al Sistema
            </h1>
            <p style={{ fontSize: '12.5px', color: '#6b7280', lineHeight: 1.4 }}>
              Caries Urbanas · Administración de relevamientos
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '9px 12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                color: '#b91c1c',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '16px',
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Usuario / Correo
              </label>
              <input
                type="text"
                required
                placeholder="usuario@santafe.gob.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#111827',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: '#111827',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                width: '100%',
                height: '38px',
                background: '#111827',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <div
            style={{
              margin: '22px 0 16px',
              borderTop: '1px solid #f3f4f6',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'relative',
                top: '-9px',
                background: '#ffffff',
                padding: '0 8px',
                fontSize: '11px',
                color: '#9ca3af',
              }}
            >
              acceso de evaluación
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            style={{
              width: '100%',
              height: '34px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              color: '#374151',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Acceder en modo prototipo →
          </button>
        </div>
      </div>

      <footer
        style={{
          borderTop: '1px solid #e5e7eb',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#9ca3af',
        }}
      >
        <span>Municipalidad de Santa Fe · Observatorio Urbano</span>
        <span>Sistema de Gestión de Inmuebles Ociosos</span>
      </footer>
    </div>
  );
}
