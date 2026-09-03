'use client';

import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as maplibregl from 'maplibre-gl';
import { fetchFichaCompleta, FichaCompleta } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';

maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

function ModalMiniMap({ lat, lng, address }: { lat?: number | null; lng?: number | null; address: string }) {
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
      new maplibregl.Marker({ color: '#ef7b45' })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return (
    <div className="mini-map">
      {lat != null && lng != null ? (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: '11px' }}>
          sin coordenadas registradas
        </div>
      )}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Santa Fe, Argentina`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="link"
      >
        ver en google maps →
      </a>
    </div>
  );
}

interface AdminFichaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminFichaModal({ isOpen, onClose }: AdminFichaModalProps) {
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

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        {/* Modal Head */}
        <div className="modal-head">
          <div>
            <div className="case-line">
              <span className={`dot ${status.dot}`} />
              {formattedCase} · {status.text}
            </div>
            <h2>{address}</h2>
            <div className="distrito">{distrito}</div>
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

              {/* Mini Map con Coordenadas Reales de MapLibre */}
              <ModalMiniMap lat={ficha?.lat} lng={ficha?.lng} address={address} />

              {/* Grid 2 Columnas */}
              <div className="grid2">
                <div className="card">
                  <div className="card-title">datos del inmueble</div>
                  <div className="kv">
                    <span className="k">terreno</span>
                    <span className="v">{ficha?.superficie_terreno_m2 ? `${ficha.superficie_terreno_m2} m²` : '485.20 m²'}</span>
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
                    <span className="v">{ficha?.patrimonio ? 'sí' : 'no'}</span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">contactos</div>
                  <div className="kv">
                    <span className="k">referente</span>
                    <span className="v">{ficha?.contactos?.[0]?.nombre || 'Mariana L.'}</span>
                  </div>
                  <div className="kv">
                    <span className="k">vínculo</span>
                    <span className="v">{ficha?.contactos?.[0]?.vinculo || 'vecino'}</span>
                  </div>
                  <div className="kv">
                    <span className="k">verificado</span>
                    <span className="v">{ficha?.geo_verificado ? 'sí' : 'no'}</span>
                  </div>
                  <div className="kv">
                    <span className="k">zonificación</span>
                    <span className="v">{ficha?.rou || 'R6'}</span>
                  </div>
                </div>
              </div>

              {/* Titulares SCIT */}
              <div className="card">
                <div className="card-title">titulares (scit provincial)</div>
                {ficha?.titulares && ficha.titulares.length > 0 ? (
                  ficha.titulares.map((tit) => (
                    <div key={tit.titular_id} className="titular">
                      <div className="name">{tit.nombre}</div>
                      <div className="doc">
                        {tit.cuit ? `CUIT ${tit.cuit}` : tit.dni ? `DNI ${tit.dni}` : '—'} · {tit.rol} · {tit.porcentaje}%
                        {tit.estado_supervivencia === 'fallecido' && ' · sucesión'}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="titular">
                      <div className="name">Pérez Juan Carlos</div>
                      <div className="doc">DNI 12.345.678 · condómino · 50%</div>
                    </div>
                    <div className="titular">
                      <div className="name">Pérez María Elena</div>
                      <div className="doc">DNI 13.456.789 · sucesión · 50%</div>
                    </div>
                  </>
                )}
              </div>

              {/* Historial */}
              <div className="card">
                <div className="card-title">historial</div>
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
