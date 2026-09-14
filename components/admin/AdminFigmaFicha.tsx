'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { RelevamientoResumen } from '@/lib/api-admin';

maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

interface AdminFigmaFichaProps {
  caseData: RelevamientoResumen | undefined;
  notesCount?: number;
  onBack: () => void;
  onGoToNotes: () => void;
  onEdit?: () => void;
}

const TIPO_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  carie: { label: 'Carie urbana', color: '#B5451B', bg: 'rgba(181,69,27,0.08)' },
  vacancia: { label: 'Vacancia', color: '#4b5563', bg: '#f3f4f6' },
};

const DISTANCIAS_SERVICIOS = ['56m — Escuela primaria', '120m — Centro de salud', '320m — Parada de colectivo', '480m — Espacio verde público'];

export function AdminFigmaFicha({
  caseData,
  notesCount = 3,
  onBack,
  onGoToNotes,
  onEdit,
}: AdminFigmaFichaProps) {
  const miniMapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [activeTab, setActiveTab] = useState<'datos' | 'titulares' | 'servicios'>('datos');

  const formattedId = caseData
    ? `#${String(caseData.nro_relevamiento || caseData.id).padStart(4, '0')}`
    : '#0000';

  const tipo = caseData?.tipo || 'carie';
  const tipoInfo = TIPO_LABELS[tipo] || TIPO_LABELS.carie;
  const isPatrimonio = Boolean(caseData?.patrimonio);

  // Seed determinista para generar datos de prototipo coherentes con el id
  const seed = Number(caseData?.id || 1);
  const superficieTerreno = 250 + ((seed * 19) % 350);
  const superficieCons = caseData?.tipo === 'vacancia' ? 0 : 80 + ((seed * 11) % 200);
  const anioPlan = 1960 + ((seed * 3) % 45);
  const zonif = `R${1 + (seed % 6)}`;

  // Mini-mapa
  useEffect(() => {
    if (!miniMapRef.current || !caseData?.lat || !caseData?.lng) return;
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = new maplibregl.Map({
      container: miniMapRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [caseData.lng, caseData.lat],
      zoom: 15.8,
      interactive: false,
      attributionControl: false,
    });
    mapInstance.current = map;

    map.on('load', () => {
      map.addSource('pin', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [caseData.lng!, caseData.lat!] },
          properties: {},
        },
      });

      map.addLayer({
        id: 'pin-pulse',
        type: 'circle',
        source: 'pin',
        paint: {
          'circle-radius': 14,
          'circle-color': '#B5451B',
          'circle-opacity': 0.15,
        },
      });

      map.addLayer({
        id: 'pin-halo',
        type: 'circle',
        source: 'pin',
        paint: {
          'circle-radius': 8,
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
          'circle-color': '#B5451B',
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
      {/* Navegación y acciones */}
      <div className="case-nav-bar">
        <button type="button" onClick={onBack} className="back-link">
          ← Volver al listado
        </button>
        {onEdit && (
          <button type="button" onClick={onEdit} className="btn-outline" style={{ fontSize: '12px', height: '30px', padding: '0 12px' }}>
            Editar
          </button>
        )}
      </div>

      {/* Encabezado del caso */}
      <div className="case-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 className="case-title">Caso {formattedId}</h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: '100px',
                background: tipoInfo.bg,
                color: tipoInfo.color,
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {tipoInfo.label}
            </span>
            {isPatrimonio && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  background: 'rgba(217,119,6,0.1)',
                  color: '#d97706',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                Patrimonio catalogado
              </span>
            )}
          </div>
          <p className="case-sub">
            {caseData?.direccion || caseData?.nombre || 'Calle sin denominación'} — Dist. {caseData?.distrito || 'CENTRO'}, Santa Fe, Dpto. La Capital
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: '#f5f4f2', padding: '4px 8px', borderRadius: '4px' }}>
            Relevamiento {caseData?.actualizado_en ? new Date(caseData.actualizado_en).getFullYear() : 2026}
          </span>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="ficha-tabs">
        {(['datos', 'titulares', 'servicios'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`ficha-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'datos' ? 'Datos del lote' : tab === 'titulares' ? 'Historial dominial' : 'Entorno urbano'}
          </button>
        ))}
      </div>

      {/* Cuadrícula de contenido */}
      <div className="case-grid">
        {/* Columna Izquierda — cambia según tab */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'datos' && (
            <div className="case-card">
              <span className="card-heading">Datos catastrales del inmueble</span>
              <div className="data-pairs">
                <div className="data-pair">
                  <span className="data-label">Superficie del terreno</span>
                  <span className="data-value">{superficieTerreno} m²</span>
                </div>
                <div className="data-pair">
                  <span className="data-label">Superficie construida</span>
                  <span className="data-value">{superficieCons > 0 ? `${superficieCons} m²` : 'Sin edificación'}</span>
                </div>
                <div className="data-pair">
                  <span className="data-label">Año de plano aprobado</span>
                  <span className="data-value">{superficieCons > 0 ? anioPlan : '—'}</span>
                </div>
                <div className="data-pair">
                  <span className="data-label">Zonificación (ROU)</span>
                  <span className="data-value">{zonif}</span>
                </div>
                <div className="data-pair">
                  <span className="data-label">Distrito municipal</span>
                  <span className="data-value">{caseData?.distrito || 'CENTRO'}</span>
                </div>
                <div className="data-pair">
                  <span className="data-label">Estado de relevamiento</span>
                  <span className="data-value" style={{ color: '#B5451B' }}>En carga</span>
                </div>
                <div className="data-pair" style={{ gridColumn: '1 / -1' }}>
                  <span className="data-label">Estado de ocupación observado</span>
                  <span className="data-value" style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                    {caseData?.tipo === 'vacancia'
                      ? 'Predio baldío o sin uso productivo constatado. Sin edificación reglamentaria visible desde la vía pública.'
                      : 'Inmueble en estado de deterioro estructural visible. Sin mantenimiento de malezas ni cerramiento conforme a ordenanza.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'titulares' && (
            <div className="case-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="card-heading" style={{ border: 'none', padding: 0 }}>Historial dominial — Titulares</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SCIT Provincial · Ley 25.326</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px' }}>
                {[
                  { nombre: 'Pérez Juan Carlos', doc: 'DNI 12.345.678', rol: 'Condómino', porc: '50%', alert: false },
                  { nombre: 'Pérez María Elena', doc: 'DNI 13.456.789', rol: 'Sucesión pendiente', porc: '50%', alert: true },
                ].map((t, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: t.alert ? '#fff8f6' : '#f9fafb',
                      borderRadius: '6px',
                      border: `1px solid ${t.alert ? 'rgba(181,69,27,0.2)' : '#f0f0f2'}`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '12.5px' }}>{t.nombre}</div>
                      <div style={{ fontSize: '11px', color: t.alert ? '#B5451B' : 'var(--text-muted)' }}>{t.doc} · {t.rol}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{t.porc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'servicios' && (
            <div className="case-card">
              <span className="card-heading">Entorno urbano inmediato</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {DISTANCIAS_SERVICIOS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '12.5px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.split(' — ')[1]}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '11.5px', color: 'var(--text-muted)' }}>{s.split(' — ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado y gestiones (siempre visible) */}
          <div className="case-card">
            <span className="card-heading">Cronología de actuaciones</span>
            <div className="timeline-list">
              {[
                { fecha: '05/04/2026', texto: 'Relevamiento inicial constatado en territorio por el Observatorio Urbano.' },
                { fecha: '12/04/2026', texto: 'Notificación municipal de saneamiento ambiental remitida a domicilio fiscal SCIT.' },
                { fecha: '24/04/2026', texto: 'Inspección ocular programada con el área de control urbano.' },
              ].map((ev, i) => (
                <div key={i} className="timeline-item">
                  <span className="timeline-bullet">●</span>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>{ev.fecha}</strong> — {ev.texto}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button type="button" className="btn-black" onClick={onGoToNotes} style={{ width: '100%' }}>
                Ver notas internas ({notesCount}) →
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Mapa */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="case-card">
            <span className="card-heading">Ubicación georreferenciada</span>
            <div
              style={{
                width: '100%',
                height: '220px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: '#f3f4f6',
              }}
            >
              {caseData?.lat && caseData?.lng ? (
                <div ref={miniMapRef} style={{ width: '100%', height: '100%' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '12px' }}>
                  Sin coordenadas registradas
                </div>
              )}
            </div>
            {caseData?.lat && (
              <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>Lat: {caseData.lat.toFixed(5)}</span>
                <span>·</span>
                <span>Lng: {caseData.lng.toFixed(5)}</span>
              </div>
            )}
          </div>

          {/* Panel de resumen rápido */}
          <div className="case-card summary-panel">
            <span className="card-heading">Resumen del registro</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Tipo de inmueble', val: tipoInfo.label },
                { label: 'Distrito', val: caseData?.distrito || 'CENTRO' },
                { label: 'Estado catastral', val: 'En carga (relevamiento)' },
                { label: 'Valor patrimonial', val: isPatrimonio ? 'Catalogado' : 'No catalogado' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '12px', padding: '5px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
