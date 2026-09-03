'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api-admin';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

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
        setErrorMsg('Credenciales incorrectas o usuario inactivo.');
      } else if (err.status === 429) {
        setErrorMsg('Demasiados intentos fallidos. Por seguridad, aguardá 15 minutos.');
      } else {
        setErrorMsg(err.message || 'Error al conectar con el servicio de autenticación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--accent-10)', borderRadius: '16px', marginBottom: '12px' }}>
            <img src="/image/cariesurbanas.svg" alt="Caries Urbanas" style={{ width: '40px', height: '40px' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            Centro de Operaciones
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Observatorio Urbano · Santa Fe
          </p>
        </div>

        {errorMsg && (
          <div className="login-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="login-input"
                placeholder="usuario@santafe.gob.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Mail size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="login-input"
                placeholder="••••••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
              />
              <Lock size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Validando sesión...</span>
              </>
            ) : (
              <>
                <span>Ingresar al panel</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="var(--green)" />
          <span>Acceso restringido · Sesiones auditadas</span>
        </div>
      </div>
    </div>
  );
}
