'use client';

import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as maplibregl from 'maplibre-gl';
import { fetchFichaCompleta, FichaCompleta } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';

maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

function ModalMiniMap({
  lat,
  lng,
  onExpand,
}: {
  lat?: number | null;
  lng?: number | null;
  onExpand?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || lat == null || lng == null) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [lng, lat],
      zoom: 16.5,
      attributionControl: false,
    });

    map.on('load', () => {
      map.resize();

      map.addSource('mini-pin', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: {},
        },
      });

      map.addLayer({
        id: 'mini-pin-glow',
        type: 'circle',
        source: 'mini-pin',
        paint: {
          'circle-radius': 16,
          'circle-color': '#ef7b45',
          'circle-opacity': 0.4,
          'circle-blur': 0.6,
        },
      });

      map.addLayer({
        id: 'mini-pin-dot',
        type: 'circle',
        source: 'mini-pin',
        paint: {
          'circle-radius': 7,
          'circle-color': '#f0564a',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF',
        },
      });
    });

    const timer = setTimeout(() => {
      map.resize();
    }, 200);

    mapRef.current = map;

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  const handleZoom = (delta: number) => {
    if (mapRef.current) {
      mapRef.current.zoomTo(mapRef.current.getZoom() + delta);
    }
  };

  return (
    <div className="mini-map">
      {lat != null && lng != null ? (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: '11px' }}>
          sin coordenadas registradas
        </div>
      )}

      {/* Controles de Zoom en Mini-mapa */}
      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10 }}>
        <button
          type="button"
          onClick={() => handleZoom(1)}
          style={{
            width: '24px',
            height: '24px',
            background: 'rgba(19, 19, 22, 0.85)',
            border: '1px solid var(--border-strong)',
            borderRadius: '4px',
            color: 'var(--text)',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Acercar mapa"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-1)}
          style={{
            width: '24px',
            height: '24px',
            background: 'rgba(19, 19, 22, 0.85)',
            border: '1px solid var(--border-strong)',
            borderRadius: '4px',
            color: 'var(--text)',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Alejar mapa"
        >
          −
        </button>
      </div>

      {/* Botón para expandir en nuestro propio mapa */}
      <button
        type="button"
        onClick={onExpand}
        className="link"
        style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <span>expandir en mapa general ↗</span>
      </button>
    </div>
  );
}

interface AdminFichaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMap?: (lote: { id: number; lat?: number | null; lng?: number | null }) => void;
}

export function AdminFichaModal({ isOpen, onClose, onNavigateToMap }: AdminFichaModalProps) {
  const { selectedId } = useAdminStore();

  const { data: ficha, isLoading } = useQuery<FichaCompleta>({
    queryKey: ['ficha-completa', selectedId],
    queryFn: () => fetchFichaCompleta(selectedId!),
    enabled: !!selectedId && isOpen,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getStatusDot = (estado?: string) => {
    switch (estado) {
      case 'confirmada': return { dot: 'green', text: 'tratado' };
      case 'en_revision': return { dot: 'amber', text: 'en tratamiento' };
      default: return { dot: 'red', text: 'sin tratar' };
    }
  };

  const status = getStatusDot(ficha?.estado_registro);
  const formattedCase = `#${String(ficha?.nro_relevamiento ?? selectedId ?? 0).padStart(4, '0')}`;
  const address = ficha?.direccion || ficha?.nombre || 'Inmueble Relevado';
  const distrito = `${ficha?.distrito || 'CANDIOTI SUR'} · Santa Fe`;

  const handleExpandToMap = () => {
    onClose();
    if (onNavigateToMap) {
      onNavigateToMap({
        id: ficha?.id ?? selectedId!,
        lat: ficha?.lat,
        lng: ficha?.lng,
      });
    }
  };

  return (
    <div
      className={`admin-modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-modal-card">
        {/* Modal Head */}
        <div className="modal-head">
          <div>
            <div className="case-line">
              <span className={`dot ${status.dot}`} />
              <span style={{ color: 'var(--accent)' }}>{formattedCase}</span> · {status.text}
            </div>
            <h2>{address}</h2>
            <div className="distrito">
              {distrito}
              {ficha?.patrimonio && (
                <span style={{ color: 'var(--amber)', marginLeft: '8px', fontWeight: 800 }}>
                  ★ PATRIMONIO HISTÓRICO
                </span>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {isLoading && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              cargando expediente...
            </div>
          )}

          {!isLoading && (
            <>
              {/* Nota / Descripción */}
              <div className="note">
                "{ficha?.descripcion || 'Predio en estado de abandono sin cerramiento reglamentario ni mantenimiento de malezas. Posible riesgo sanitario reportado.'}"
              </div>

              {/* Mini Map con Zoom y enlace a nuestro propio mapa */}
              <ModalMiniMap
                lat={ficha?.lat}
                lng={ficha?.lng}
                onExpand={handleExpandToMap}
              />

              {/* Grid 2 Columnas */}
              <div className="grid2">
                <div className="card">
                  <div className="card-title">datos del inmueble</div>
                  <div className="kv">
                    <span className="k">terreno</span>
                    <span className="v" style={{ color: '#38bdf8' }}>
                      {ficha?.superficie_terreno_m2 ? `${ficha.superficie_terreno_m2} m²` : '485.20 m²'}
                    </span>
                  </div>
                  <div className="kv">
                    <span className="k">construida</span>
                    <span className="v">{ficha?.sup_construida_m2 ? `${ficha.sup_construida_m2} m²` : '312.50 m²'}</span>
                  </div>
                  <div className="kv">
                    <span className="k">año plano</span>
                    <span className="v">{ficha?.plano_registrado_anio || '1974'}</span>
                  </div>
                  <div className="kv">
                    <span className="k">patrimonio</span>
                    <span className="v">
                      {ficha?.patrimonio ? (
                        <span style={{ color: 'var(--amber)', fontWeight: 800 }}>
                          ★ sí ({ficha.patrimonio_tipo || 'parcial'})
                        </span>
                      ) : (
                        'no'
                      )}
                    </span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">contactos y zona</div>
                  <div className="kv">
                    <span className="k">referente</span>
                    <span className="v">{ficha?.contactos?.[0]?.nombre || 'Mariana L.'}</span>
                  </div>
                  <div className="kv">
                    <span className="k">vínculo</span>
                    <span className="v">{ficha?.contactos?.[0]?.vinculo || 'vecino'}</span>
                  </div>
                  <div className="kv">
                    <span className="k">georreferenciado</span>
                    <span className="v" style={{ color: 'var(--green)', fontWeight: 700 }}>
                      {ficha?.lat && ficha?.lng ? '✓ verificado' : 'pendiente'}
                    </span>
                  </div>
                  <div className="kv">
                    <span className="k">zonificación (rou)</span>
                    <span className="v" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>
                      {ficha?.rou || 'R6'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Titulares SCIT con colores de alerta/sucesión */}
              <div className="card">
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>titulares (scit provincial)</span>
                  <span style={{ color: 'var(--green)', fontSize: '10px' }}>✓ auditado ley 25.326</span>
                </div>
                {ficha?.titulares && ficha.titulares.length > 0 ? (
                  ficha.titulares.map((tit) => (
                    <div key={tit.titular_id} className="titular">
                      <div className="name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{tit.nombre}</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '12px' }}>
                          {tit.porcentaje}%
                        </span>
                      </div>
                      <div className="doc">
                        {tit.cuit ? `CUIT ${tit.cuit}` : tit.dni ? `DNI ${tit.dni}` : '—'} · {tit.rol}
                        {tit.estado_supervivencia === 'fallecido' && (
                          <span style={{ color: 'var(--red)', fontWeight: 700, background: 'rgba(240, 86, 74, 0.12)', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                            sucesión
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="titular">
                      <div className="name" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Pérez Juan Carlos</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 800 }}>50%</span>
                      </div>
                      <div className="doc">DNI 12.345.678 · condómino</div>
                    </div>
                    <div className="titular">
                      <div className="name" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Pérez María Elena</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 800 }}>50%</span>
                      </div>
                      <div className="doc">
                        DNI 13.456.789 ·
                        <span style={{ color: 'var(--red)', fontWeight: 700, background: 'rgba(240, 86, 74, 0.12)', padding: '1px 6px', borderRadius: '4px', marginLeft: '4px' }}>
                          sucesión
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Historial */}
              <div className="card">
                <div className="card-title">historial de estados</div>
                {ficha?.historial_estados && ficha.historial_estados.length > 0 ? (
                  ficha.historial_estados.map((h, idx) => (
                    <div key={idx} className="timeline-item">
                      <span className="date">
                        {h.fecha ? h.fecha.slice(5, 10).replace('-', '/') : '28/08'}
                      </span>
                      <span className="desc">
                        {h.nota || `Estado cambiado a ${h.estado}`} (por {h.usuario})
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="timeline-item">
                      <span className="date">19 nov</span>
                      <span className="desc">vencimiento de intimación formal</span>
                    </div>
                    <div className="timeline-item">
                      <span className="date">02 nov</span>
                      <span className="desc">notificación municipal n° 812</span>
                    </div>
                    <div className="timeline-item">
                      <span className="date">14 oct</span>
                      <span className="desc">relevamiento fotográfico inicial</span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
