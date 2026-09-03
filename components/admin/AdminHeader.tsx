'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getUser } from '@/lib/api-admin';
import { MapPin, Inbox, ExternalLink, LogOut, Shield } from 'lucide-react';

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUserState] = useState<{ nombre: string; rol: string } | null>(null);

  useEffect(() => {
    setUserState(getUser());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/admin/login');
  };

  return (
    <header className="admin-header">
      <div className="admin-header-brand">
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          <img src="/image/cariesurbanas.svg" alt="Caries Urbanas" style={{ width: '28px', height: '28px' }} />
          <span>Caries Urbanas</span>
        </Link>
        <span className="admin-header-brand-sub">Centro de Operaciones</span>
      </div>

      <nav className="admin-header-nav">
        <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
          <MapPin size={15} style={{ marginRight: '6px' }} />
          Relevamientos
        </Link>
        <Link href="/admin/denuncias" className={pathname === '/admin/denuncias' ? 'active' : ''}>
          <Inbox size={15} style={{ marginRight: '6px' }} />
          Bandeja de Denuncias
        </Link>
        <Link href="/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
          <ExternalLink size={14} style={{ marginRight: '4px' }} />
          Vista Ciudadana
        </Link>
      </nav>

      <div className="admin-header-user">
        {user ? (
          <div className="admin-header-user-info">
            <span className="admin-header-user-name">{user.nombre}</span>
            <span className="admin-header-user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={11} color="var(--accent)" />
              Rol: {user.rol}
            </span>
          </div>
        ) : (
          <div className="admin-header-user-info">
            <span className="admin-header-user-name">Observador</span>
            <span className="admin-header-user-role">Modo lectura</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
