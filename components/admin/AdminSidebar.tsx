'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession, getUser } from '@/lib/api-admin';

interface AdminSidebarProps {
  currentTab: 'relevamientos' | 'mapa';
  onSelectTab: (tab: 'relevamientos' | 'mapa') => void;
}

export function AdminSidebar({ currentTab, onSelectTab }: AdminSidebarProps) {
  const router = useRouter();
  const [userName, setUserName] = useState('usuario');

  useEffect(() => {
    const u = getUser();
    if (u?.nombre) setUserName(u.nombre.toLowerCase());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/admin/login');
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <Link href="/admin" className="brand-name">
          Caries Urbanas
        </Link>
        <div className="brand-tag">ADMIN</div>
      </div>

      <nav className="nav">
        <div
          className={`nav-item ${currentTab === 'relevamientos' ? 'active' : ''}`}
          onClick={() => onSelectTab('relevamientos')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          relevamientos
        </div>

        <div
          className={`nav-item ${currentTab === 'mapa' ? 'active' : ''}`}
          onClick={() => onSelectTab('mapa')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2 2 7l10 5 10-5-10-5Z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          mapa
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-item"
          style={{ marginTop: '16px', color: 'var(--text-tertiary)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          ver web ↗
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="who" title={userName}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
          <span>{userName}</span>
        </div>

        <button className="exit" onClick={handleLogout} title="Cerrar sesión">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
