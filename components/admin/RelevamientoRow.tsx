'use client';

import React from 'react';
import { RelevamientoResumen } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';
import { ChevronRight, Landmark } from 'lucide-react';

interface RelevamientoRowProps {
  item: RelevamientoResumen;
}

export function RelevamientoRow({ item }: RelevamientoRowProps) {
  const { selectedId, selectRelevamiento, setHoveredId } = useAdminStore();
  const isSelected = selectedId === item.id;

  const getStatusPill = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return <span className="ios-pill ios-pill--confirmada"><span className="ios-pill-dot" />Confirmada</span>;
      case 'en_revision':
        return <span className="ios-pill ios-pill--en_revision"><span className="ios-pill-dot" />Revisión</span>;
      case 'eliminada':
        return <span className="ios-pill ios-pill--eliminada"><span className="ios-pill-dot" />Baja</span>;
      default:
        return <span className="ios-pill ios-pill--carga"><span className="ios-pill-dot" />En carga</span>;
    }
  };

  return (
    <div
      className={`glass-row ${isSelected ? 'selected' : ''}`}
      onClick={() => selectRelevamiento(item.id)}
      onMouseEnter={() => setHoveredId(item.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="glass-row-main">
        <div className="glass-row-header">
          <span className="glass-lote-tag">
            #{String(item.nro_relevamiento ?? item.id).padStart(3, '0')}
          </span>
          <span className="glass-row-address">
            {item.direccion || item.nombre || 'Inmueble sin calle'}
          </span>
        </div>

        <div className="glass-row-meta">
          <span>{item.distrito || 'Sin distrito'}</span>
          {item.patrimonio && (
            <>
              <span className="dot" />
              <span style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Landmark size={11} /> Patrimonio
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {getStatusPill(item.estado_registro)}
        <ChevronRight size={14} style={{ color: 'var(--text-muted)', opacity: isSelected ? 1 : 0.6 }} />
      </div>
    </div>
  );
}
