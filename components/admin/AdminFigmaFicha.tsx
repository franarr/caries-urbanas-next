'use client';

import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { RelevamientoResumen } from '@/lib/api-admin';

maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

interface AdminFigmaFichaProps {
  caseData: RelevamientoResumen | undefined;
  notesCount?: number;
  onBack: () => void;
  onGoToNotes: () => void;
}

export function AdminFigmaFicha({
  caseData,
  notesCount = 3,
  onBack,
  onGoToNotes,
}: AdminFigmaFichaProps) {
  const miniMapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  const formattedId = caseData
    ? `#${String(caseData.nro_relevamiento || caseData.id).padStart(4, '0')}`
    : '#0000';

  const estado = caseData?.estado_registro || 'carga';
  const getStatusColor = (st: string) => {
    switch (st) {
      case 'confirmada': return { color: 'var(--status-green)', label: 'Tratado' };
      case 'en_revision': return { color: 'var(--status-amber)', label: 'En revisión' };
      default: return { color: 'var(--status-red)', label: 'Sin tratar' };
    }
  };
  const statusInfo = getStatusColor(estado);

  // Inicializar mini-mapa con Carto Positron
  useEffect(() => {
    if (!miniMapRef.current || !caseData?.lat || !caseData?.lng) return;

    const map = new maplibregl.Map({
      container: miniMapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [caseData.lng, caseData.lat],
      zoom: 15.5,
      interactive: false,
      attributionControl: false,
    });
    mapInstance.current = map;

    map.on('load', () => {
      // Marcador del lote
      map.addSource('pin', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [caseData.lng!, caseData.lat!],
          },
          properties: {},
        },
      });

      map.addLayer({
        id: 'pin-halo',
        type: 'circle',
        source: 'pin',
        paint: {
          'circle-radius': 9,
          'circle-color': '#ffffff',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#d1d5db',
        },
      });

      map.addLayer({
        id: 'pin-dot',
        type: 'circle',
        source: 'pin',
        paint: {
          'circle-radius': 5,
          'circle-color': '#e11d48',
        },
      });
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [caseData]);

  return (
    <div className="case-view">
      {/* Retorno al listado */}
      <div>
        <button type="button" onClick={onBack} className="back-link">
          ← Volver al listado general
        </button>
      </div>

      {/* Encabezado del caso */}
      <div className="case-header">
        <div>
          <h1 className="case-title">Caso {formattedId}</h1>
          <p className="case-sub">
            {caseData?.direccion || caseData?.nombre || 'Calle sin denominación'} — {caseData?.distrito || 'Santa Fe'}, Dpto. La Capital
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            fontSize: '11.5px',
            fontWeight: 600,
            color: statusInfo.color,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: statusInfo.color,
            }}
          />
          {statusInfo.label}
        </div>
      </div>

      {/* Cuadrícula de 2 columnas */}
      <div className="case-grid">
        {/* Columna Izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Bloque: Datos del Lote */}
          <div className="case-card">
            <span className="card-heading">Datos del Lote</span>
            <div className="data-pairs">
              <div className="data-pair">
                <span className="data-label">Superficie Terreno</span>
                <span className="data-value">{350 + ((Number(caseData?.id || 1) * 19) % 300)} m²</span>
              </div>
              <div className="data-pair">
                <span className="data-label">Superficie Construida</span>
                <span className="data-value">{180 + ((Number(caseData?.id || 1) * 11) % 150)} m²</span>
              </div>
              <div className="data-pair">
                <span className="data-label">Año de Plano</span>
                <span className="data-value">{1965 + ((Number(caseData?.id || 1) * 3) % 40)}</span>
              </div>
              <div className="data-pair">
                <span className="data-label">Zonificación (ROU)</span>
                <span className="data-value">R{1 + (Number(caseData?.id || 1) % 6)}</span>
              </div>
              <div className="data-pair" style={{ gridColumn: '1 / -1' }}>
                <span className="data-label">Estado de Ocupación</span>
                <span className="data-value" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Predio en estado de abandono sin cerramiento reglamentario ni mantenimiento de malezas.
                </span>
              </div>
            </div>
          </div>

          {/* Bloque: Historial Catastral / Titulares */}
          <div className="case-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="card-heading" style={{ border: 'none', padding: 0 }}>Historial Catastral / Titulares</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SCIT Provincial Ley 25.326</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: '#f9fafb',
                  borderRadius: '4px',
                  border: '1px solid #f0f0f2',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>Pérez Juan Carlos</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DNI 12.345.678 · Condómino</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>50%</div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: '#f9fafb',
                  borderRadius: '4px',
                  border: '1px solid #f0f0f2',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>Pérez María Elena</div>
                  <div style={{ fontSize: '11px', color: 'var(--status-red)' }}>DNI 13.456.789 · Sucesión</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>50%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Bloque: Ubicación Geográfica */}
          <div className="case-card">
            <span className="card-heading">Ubicación Geográfica</span>
            <div
              style={{
                width: '100%',
                height: '180px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: '#f3f4f6',
              }}
            >
              <div ref={miniMapRef} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

          {/* Bloque: Estado y Gestiones */}
          <div className="case-card">
            <span className="card-heading">Estado y Gestiones</span>
            <div className="timeline-list">
              <div className="timeline-item">
                <span className="timeline-bullet">●</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>05/04/2026</strong> — Relevamiento inicial constatado en territorio.
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-bullet">●</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>12/04/2026</strong> — Notificación municipal de saneamiento ambiental remitida.
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-bullet">●</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>24/04/2026</strong> — Inspección ocular programada con el área de control.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                className="btn-black"
                onClick={onGoToNotes}
                style={{ width: '100%' }}
              >
                Ver notas internas ({notesCount}) →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
