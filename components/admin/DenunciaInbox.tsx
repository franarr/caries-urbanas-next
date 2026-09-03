'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDenuncias } from '@/lib/api-admin';
import { DenunciaCard } from '@/components/admin/DenunciaCard';
import { Inbox, Loader2, AlertCircle } from 'lucide-react';

export function DenunciaInbox() {
  const [activeTab, setActiveTab] = useState<'todas' | 'pendiente' | 'en_curso' | 'resuelta'>('todas');
  const [pagina, setPagina] = useState(1);

  const estadoParam = activeTab === 'todas' ? undefined : activeTab;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-denuncias', estadoParam, pagina],
    queryFn: () => fetchDenuncias({ pagina, tamanio: 25, estado: estadoParam }),
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-white)' }}>
      {/* Banner explicativo del prototipo */}
      <div style={{ padding: '12px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-body)' }}>
        <AlertCircle size={15} color="var(--accent)" />
        <span>
          <strong>Bandeja de Moderación Ciudadana:</strong> Reportes recibidos desde el formulario web de Caries Urbanas. Modo lectura activo.
        </span>
      </div>

      {/* Pestañas de estado */}
      <div className="denuncia-tabs">
        <button
          className={`denuncia-tab ${activeTab === 'todas' ? 'active' : ''}`}
          onClick={() => { setActiveTab('todas'); setPagina(1); }}
        >
          Todas
        </button>
        <button
          className={`denuncia-tab ${activeTab === 'pendiente' ? 'active' : ''}`}
          onClick={() => { setActiveTab('pendiente'); setPagina(1); }}
        >
          Pendientes
        </button>
        <button
          className={`denuncia-tab ${activeTab === 'en_curso' ? 'active' : ''}`}
          onClick={() => { setActiveTab('en_curso'); setPagina(1); }}
        >
          En Curso
        </button>
        <button
          className={`denuncia-tab ${activeTab === 'resuelta' ? 'active' : ''}`}
          onClick={() => { setActiveTab('resuelta'); setPagina(1); }}
        >
          Resueltas
        </button>
      </div>

      {/* Lista de reportes */}
      <div className="denuncia-list">
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '12px', color: 'var(--text-muted)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.875rem' }}>Cargando denuncias...</span>
          </div>
        )}

        {isError && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--red)' }}>
            <p style={{ fontWeight: 600 }}>Error al cargar las denuncias</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Verificá la conexión con la API del backend.
            </p>
          </div>
        )}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Inbox size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>No hay denuncias en esta bandeja</p>
            <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
              Los reportes enviados por los vecinos a través del mapa aparecerán aquí.
            </p>
          </div>
        )}

        {!isLoading && data && data.items.map((denuncia) => (
          <DenunciaCard key={denuncia.id} denuncia={denuncia} />
        ))}
      </div>

      {/* Footer de conteo */}
      {data && (
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg)' }}>
          Total en base de datos: {data.total} reportes
        </div>
      )}
    </div>
  );
}
