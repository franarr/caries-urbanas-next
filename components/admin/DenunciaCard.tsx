'use client';

import React from 'react';
import { Denuncia } from '@/lib/api-admin';
import { MapPin, Phone, Calendar, AlertCircle } from 'lucide-react';

interface DenunciaCardProps {
  denuncia: Denuncia;
}

export function DenunciaCard({ denuncia }: DenunciaCardProps) {
  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'baldio': return 'Terreno baldío';
      case 'casa_abandonada': return 'Casa abandonada';
      case 'ambiental': return 'Riesgo ambiental';
      default: return tipo;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return { bg: 'rgba(232, 93, 38, 0.12)', color: 'var(--accent)', label: 'Pendiente' };
      case 'en_curso': return { bg: 'rgba(249, 168, 37, 0.15)', color: 'var(--orange-status)', label: 'En curso' };
      case 'resuelta': return { bg: 'rgba(52, 168, 83, 0.15)', color: 'var(--green)', label: 'Resuelta' };
      default: return { bg: '#EFEFEF', color: 'var(--text-body)', label: estado };
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const status = getStatusColor(denuncia.estado);

  return (
    <div className="denuncia-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-dark)' }}>
            #{denuncia.id}
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
            }}
          >
            {getTipoLabel(denuncia.tipo)}
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              backgroundColor: status.bg,
              color: status.color,
            }}
          >
            {status.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Calendar size={12} />
          <span>{formatDate(denuncia.creado_en)}</span>
        </div>
      </div>

      <div style={{ fontSize: '0.875rem', color: 'var(--text-body)', marginBottom: '10px', lineHeight: 1.5 }}>
        {denuncia.descripcion}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {denuncia.direccion ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="var(--accent)" />
            {denuncia.direccion}
          </span>
        ) : (
          <span style={{ fontStyle: 'italic' }}>Sin dirección escrita</span>
        )}

        {denuncia.tiene_contacto && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--green)', fontWeight: 600 }}>
            <Phone size={12} />
            Dejó contacto (auditado)
          </span>
        )}

        <span style={{ marginLeft: 'auto', textTransform: 'capitalize' }}>
          Origen: {denuncia.origen === 'web' ? 'Mapa Web' : 'Línea 0800'}
        </span>
      </div>
    </div>
  );
}
