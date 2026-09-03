'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFichaCompleta, FichaCompleta } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';
import { X, ExternalLink, ShieldCheck, MapPin, Building, Users, Calendar, Loader2 } from 'lucide-react';

export function SidePeek() {
  const { selectedId, peekOpen, closePeek } = useAdminStore();

  const { data: ficha, isLoading } = useQuery<FichaCompleta>({
    queryKey: ['ficha-completa', selectedId],
    queryFn: () => fetchFichaCompleta(selectedId!),
    enabled: !!selectedId && peekOpen,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePeek();
    };
    if (peekOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [peekOpen, closePeek]);

  if (!peekOpen) return null;

  const getStatusPill = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return <span className="ios-pill ios-pill--confirmada"><span className="ios-pill-dot" />Confirmada</span>;
      case 'en_revision':
        return <span className="ios-pill ios-pill--en_revision"><span className="ios-pill-dot" />En revisión</span>;
      case 'eliminada':
        return <span className="ios-pill ios-pill--eliminada"><span className="ios-pill-dot" />Baja</span>;
      default:
        return <span className="ios-pill ios-pill--carga"><span className="ios-pill-dot" />En carga</span>;
    }
  };

  return (
    <aside className="admin-inspector-card" aria-label="Inspector de Lote">
      {/* Inspector Header */}
      <div className="inspector-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--accent)' }}>
              LOTE #{String(ficha?.nro_relevamiento ?? selectedId).padStart(3, '0')}
            </span>
            {ficha && getStatusPill(ficha.estado_registro)}
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
            {ficha?.direccion || ficha?.nombre || 'Consultando inmueble...'}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Distrito {ficha?.distrito || '—'} · {ficha?.vecinal || 'Santa Fe'}
          </span>
        </div>

        <button className="inspector-close-btn" onClick={closePeek} title="Cerrar inspector">
          <X size={15} />
        </button>
      </div>

      <div className="inspector-body">
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '10px', color: 'var(--text-muted)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Cargando expediente...</span>
          </div>
        )}

        {ficha && (
          <>
            {/* Grid de Métricas Principales (Apple Style) */}
            <div className="inspector-metric-grid">
              <div className="inspector-metric-card">
                <span className="inspector-metric-label">Sup. Terreno</span>
                <span className="inspector-metric-value">
                  {ficha.superficie_terreno_m2 ? `${Number(ficha.superficie_terreno_m2).toFixed(0)} m²` : '—'}
                </span>
              </div>

              <div className="inspector-metric-card">
                <span className="inspector-metric-label">Construida</span>
                <span className="inspector-metric-value">
                  {ficha.sup_construida_m2 ? `${Number(ficha.sup_construida_m2).toFixed(0)} m²` : '—'}
                </span>
              </div>

              <div className="inspector-metric-card">
                <span className="inspector-metric-label">Zonificación</span>
                <span className="inspector-metric-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {ficha.rou || '—'}
                </span>
              </div>

              <div className="inspector-metric-card">
                <span className="inspector-metric-label">Año Plano</span>
                <span className="inspector-metric-value">
                  {ficha.plano_registrado_anio || '—'}
                </span>
              </div>
            </div>

            {/* Identificación Catastral */}
            <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: 'var(--ios-radius-sm)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Padrones (Municipal):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{ficha.padrones?.join(', ') || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Partida (SCIT):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{ficha.partidas?.join(', ') || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Manzana:</span>
                <span style={{ fontWeight: 600 }}>{ficha.manzana || '—'}</span>
              </div>
            </div>

            {/* Titularidad (SCIT) */}
            {ficha.titulares && ficha.titulares.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                    Titularidad de Dominio (SCIT)
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={11} /> Auditado
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ficha.titulares.map((tit) => (
                    <div key={tit.titular_id} className="inspector-titular-pill">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{tit.nombre}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>
                          {Number(tit.porcentaje).toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <span>{tit.cuit ? `CUIT ${tit.cuit}` : tit.dni ? `DNI ${tit.dni}` : '—'}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{tit.rol}</span>
                        {tit.estado_supervivencia === 'fallecido' && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--red)', fontWeight: 700 }}>Sucesión</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Maps Button */}
            {ficha.direccion && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ficha.direccion}, Santa Fe, Argentina`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-island-btn"
                style={{ justifyContent: 'center', padding: '12px', borderRadius: 'var(--ios-radius-sm)', background: '#FFFFFF', color: 'var(--text-dark)', boxShadow: 'var(--glass-shadow-sm)', marginTop: 'auto' }}
              >
                <MapPin size={14} color="var(--accent)" />
                <span>Abrir en Google Maps</span>
                <ExternalLink size={12} style={{ opacity: 0.6 }} />
              </a>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
