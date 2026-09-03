'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession, getUser, getToken } from '@/lib/api-admin';
import { ExternalLink, LogOut, Sparkles } from 'lucide-react';

export function AdminHeader() {
  const router = useRouter();
  const [user, setUserState] = useState<{ nombre: string; rol: string } | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setUserState(getUser());
    setIsDemo(getToken() === 'demo-token');
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/admin/login');
  };

  return (
    <div className="admin-island-top">
      <Link href="/admin" className="admin-island-brand">
        <img src="/image/cariesurbanas.svg" alt="Caries Urbanas" className="admin-island-logo" />
        <span className="admin-island-title">Caries Urbanas</span>
      </Link>

      <span className="admin-island-badge">
        {isDemo ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-dark)' }}>
            <Sparkles size={11} /> Prototipo
          </span>
        ) : (
          user?.rol ? `Rol: ${user.rol}` : 'Observatorio'
        )}
      </span>

      <div className="admin-island-divider" />

      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="admin-island-btn"
        title="Abrir mapa ciudadano público"
      >
        <span>Vista Ciudadana</span>
        <ExternalLink size={12} />
      </Link>

      <button
        onClick={handleLogout}
        className="admin-island-btn"
        title="Salir del panel"
        style={{ padding: '5px 8px' }}
      >
        <LogOut size={13} />
      </button>
    </div>
  );
}
