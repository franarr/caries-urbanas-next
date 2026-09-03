'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDenuncias } from '@/lib/api-admin';

interface KpiBarProps {
  totalItems: number | undefined;
}

export function KpiBar({ totalItems = 383 }: KpiBarProps) {
  // Consultar total de denuncias
  const { data: denunciasData } = useQuery({
    queryKey: ['admin-denuncias-kpi'],
    queryFn: () => fetchDenuncias({ pagina: 1, tamanio: 1 }),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="admin-kpi-bar">
      <div className="admin-kpi">
        <span className="admin-kpi-value" style={{ color: 'var(--accent)' }}>
          {totalItems}
        </span>
        <span className="admin-kpi-label">Inmuebles Relevados</span>
      </div>

      <div className="admin-kpi">
        <span className="admin-kpi-value">8</span>
        <span className="admin-kpi-label">Distritos Cubiertos</span>
      </div>

      <div className="admin-kpi">
        <span className="admin-kpi-value" style={{ color: 'var(--green)' }}>
          100%
        </span>
        <span className="admin-kpi-label">Geocodificados</span>
      </div>

      <div className="admin-kpi">
        <span className="admin-kpi-value" style={{ color: denunciasData?.total ? 'var(--orange-status)' : 'var(--text-muted)' }}>
          {denunciasData ? denunciasData.total : '—'}
        </span>
        <span className="admin-kpi-label">Denuncias Ciudadanas</span>
      </div>
    </div>
  );
}
