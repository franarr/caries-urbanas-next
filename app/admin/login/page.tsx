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
        setErrorMsg('credenciales incorrectas');
      } else if (err.status === 429) {
        setErrorMsg('demasiados intentos, aguarde 15 min');
      } else {
        setErrorMsg(err.message || 'error de conexión');
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
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#09090b',
        color: '#fafafa',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: '#131316',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '28px 24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: "'Spectral', serif", fontSize: '20px', fontWeight: 600, color: '#fafafa' }}>
            Caries Urbanas
          </div>
          <div style={{ fontSize: '10.5px', color: '#ef7b45', letterSpacing: '0.5px', marginTop: '2px', fontWeight: 600 }}>
            ADMIN · OBSERVATORIO
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(240, 86, 74, 0.1)',
              border: '1px solid rgba(240, 86, 74, 0.3)',
              borderRadius: '6px',
              color: '#f0564a',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            ! {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#97979d', marginBottom: '5px' }}>
              correo
            </label>
            <input
              type="email"
              required
              placeholder="usuario@santafe.gob.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: '#09090b',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: '#fafafa',
                fontFamily: 'inherit',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#97979d', marginBottom: '5px' }}>
              contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              style={{
                width: '100%',
                background: '#09090b',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: '#fafafa',
                fontFamily: 'inherit',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#ef7b45',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '9px',
              fontFamily: 'inherit',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '4px',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'autenticando...' : 'ingresar →'}
          </button>
        </form>

        <div style={{ margin: '18px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          <span style={{ fontSize: '10px', color: '#55555b' }}>o bien</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
        </div>

        <button
          type="button"
          onClick={handleDemo}
          style={{
            width: '100%',
            background: 'transparent',
            color: '#97979d',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontFamily: 'inherit',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fafafa';
            e.currentTarget.style.borderColor = '#ef7b45';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#97979d';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
          }}
        >
          explorar en modo prototipo →
        </button>
      </div>
    </div>
  );
}
