'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, loginDemo } from '@/lib/api-admin';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, Sparkles } from 'lucide-react';

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
        setErrorMsg('Credenciales incorrectas.');
      } else if (err.status === 429) {
        setErrorMsg('Demasiados intentos. Aguardá 15 minutos.');
      } else {
        setErrorMsg(err.message || 'Error al conectar con la autenticación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-canvas">
      <div className="login-glass-card">
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '12px',
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
              marginBottom: '14px',
            }}
          >
            <img src="/image/cariesurbanas.svg" alt="Caries Urbanas" style={{ width: '36px', height: '36px' }} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.03em', margin: 0 }}>
            Centro de Operaciones
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Observatorio Urbano de Santa Fe
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(217, 48, 37, 0.08)',
              border: '1px solid rgba(217, 48, 37, 0.2)',
              borderRadius: 'var(--ios-radius-sm)',
              color: 'var(--red)',
              fontSize: '0.8125rem',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="glass-search-input"
                style={{ padding: '0 36px 0 14px', borderRadius: 'var(--ios-radius-sm)', background: '#FFFFFF' }}
                placeholder="usuario@santafe.gob.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Mail size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="glass-search-input"
                style={{ padding: '0 36px 0 14px', borderRadius: 'var(--ios-radius-sm)', background: '#FFFFFF' }}
                placeholder="••••••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
              />
              <Lock size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-full"
            style={{
              padding: '12px',
              borderRadius: 'var(--ios-radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px',
              boxShadow: '0 8px 24px rgba(232, 93, 38, 0.25)',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Validando...</span>
              </>
            ) : (
              <>
                <span>Ingresar con cuenta</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div style={{ margin: '18px 0 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            O para demostración
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
        </div>

        <button
          type="button"
          onClick={() => {
            loginDemo('admin');
            router.push('/admin');
          }}
          className="admin-island-btn accent"
          style={{
            justifyContent: 'center',
            padding: '12px',
            borderRadius: 'var(--ios-radius-sm)',
            fontSize: '0.875rem',
            width: '100%',
          }}
        >
          <Sparkles size={14} />
          <span>Explorar en Modo Prototipo</span>
        </button>

        <div style={{ marginTop: '20px', fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <ShieldCheck size={13} color="var(--green)" />
          <span>Acceso seguro · Sesiones auditadas</span>
        </div>
      </div>
    </div>
  );
}
