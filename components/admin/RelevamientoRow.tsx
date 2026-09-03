'use client';

import React from 'react';
import { RelevamientoResumen } from '@/lib/api-admin';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useAdminStore } from '@/lib/store';
import { Landmark, Compass } from 'lucide-react';

interface RelevamientoRowProps {
  item: RelevamientoResumen;
}

export function RelevamientoRow({ item }: RelevamientoRowProps) {
  const { selectedId, selectRelevamiento, setHoveredId } = useAdminStore();
  const isSelected = selectedId === item.id;

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`admin-row ${isSelected ? 'selected' : ''}`}
      onClick={() => selectRelevamiento(item.id)}
      onMouseEnter={() => setHoveredId(item.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="admin-row-main">
        <div className="admin-row-title">
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginRight: '8px' }}>
            #{String(item.nro_relevamiento ?? item.id).padStart(3, '0')}
          </span>
          {item.direccion || item.nombre || 'Inmueble sin dirección'}
        </div>
        <div className="admin-row-meta">
          <span>{item.distrito || 'Sin distrito'}</span>
          <span>•</span>
          <span style={{ textTransform: 'capitalize' }}>{item.tipo}</span>
          {item.patrimonio && (
            <>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-dark)', fontWeight: 600 }}>
                <Landmark size={11} /> Patrimonio
              </span>
            </>
          )}
          {item.lat && item.lng && (
            <>
              <span>•</span>
              <span title="Georreferenciado" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Compass size={11} /> Con coordenadas
              </span>
            </>
          )}
        </div>
      </div>

      <div className="admin-row-right">
        <StatusBadge estado={item.estado_registro} size="sm" />
        <span className="admin-row-date">{formatDate(item.actualizado_en)}</span>
      </div>
    </div>
  );
}
