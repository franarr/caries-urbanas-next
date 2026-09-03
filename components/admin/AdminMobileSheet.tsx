'use client';

import React, { useState } from 'react';
import { RelevamientoResumen, Catalogos } from '@/lib/api-admin';

interface AdminMobileSheetProps {
  items: RelevamientoResumen[];
  totalCount?: number;
  catalogos?: Catalogos;
  onSelectLote: (item: RelevamientoResumen) => void;
}

export function AdminMobileSheet({
  items,
  totalCount = 383,
  catalogos,
  onSelectLote,
}: AdminMobileSheetProps) {
  const [activeTab, setActiveTab] = useState<'lotes' | 'resumen'>('lotes');
  const [sheetState, setSheetState] = useState<'peek' | 'half' | 'full'>('half');
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  // Filtrado local en vivo
  const filtered = items.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const addr = (item.direccion || item.nombre || '').toLowerCase();
      const dist = (item.distrito || '').toLowerCase();
      const num = String(item.nro_relevamiento || '');
      if (!addr.includes(q) && !dist.includes(q) && !num.includes(q)) return false;
    }
    if (filterEstado !== 'todos' && item.estado_registro !== filterEstado) {
      return false;
    }
    return true;
  });

  const getStatusDot = (estado?: string) => {
    switch (estado) {
      case 'confirmada': return { color: 'var(--green)', label: 'tratado' };
      case 'en_revision': return { color: 'var(--amber)', label: 'en tratamiento' };
      default: return { color: 'var(--red)', label: 'sin tratar' };
    }
  };

  const cycleHeight = () => {
    if (sheetState === 'peek') setSheetState('half');
    else if (sheetState === 'half') setSheetState('full');
    else setSheetState('half');
  };

  return (
    <div className={`mobile-bottom-sheet ${sheetState}`}>
      {/* Handle de arrastre táctil */}
      <div className="sheet-handle-bar" onClick={cycleHeight}>
        <div className="sheet-handle" />
      </div>

      {/* Segmented Control estilo Lisomaps */}
      <div className="sheet-tabs-container">
        <div className="segmented-control">
          <button
            type="button"
            className={`seg-item ${activeTab === 'lotes' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('lotes');
              if (sheetState === 'peek') setSheetState('half');
            }}
          >
            <span>📋 Inmuebles ({filtered.length})</span>
          </button>
          <button
            type="button"
            className={`seg-item ${activeTab === 'resumen' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('resumen');
              if (sheetState === 'peek') setSheetState('half');
            }}
          >
            <span>📊 Resumen & KPIs</span>
          </button>
        </div>
      </div>

      {/* Contenido según pestaña activa */}
      <div className="sheet-content-scroll">
        {activeTab === 'lotes' && (
          <>
            {/* Buscador táctil */}
            <div className="sheet-search-row">
              <div className="sheet-search-input-wrap">
                <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar calle, número o distrito..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sheet-search-input"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Chips de filtro rápido */}
            <div className="sheet-chips-row">
              <button
                type="button"
                className={`sheet-chip ${filterEstado === 'todos' ? 'active' : ''}`}
                onClick={() => setFilterEstado('todos')}
              >
                todos ({items.length})
              </button>
              <button
                type="button"
                className={`sheet-chip ${filterEstado === 'carga' ? 'active' : ''}`}
                onClick={() => setFilterEstado('carga')}
              >
                <span className="dot red" style={{ width: '6px', height: '6px' }} /> sin tratar
              </button>
              <button
                type="button"
                className={`sheet-chip ${filterEstado === 'en_revision' ? 'active' : ''}`}
                onClick={() => setFilterEstado('en_revision')}
              >
                <span className="dot amber" style={{ width: '6px', height: '6px' }} /> en tratamiento
              </button>
              <button
                type="button"
                className={`sheet-chip ${filterEstado === 'confirmada' ? 'active' : ''}`}
                onClick={() => setFilterEstado('confirmada')}
              >
                <span className="dot green" style={{ width: '6px', height: '6px' }} /> tratados
              </button>
            </div>

            {/* Lista de tarjetas táctiles de inmuebles */}
            <div className="sheet-items-list">
              {filtered.length === 0 && (
                <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                  No se encontraron inmuebles con ese filtro.
                </div>
              )}

              {filtered.map((item) => {
                const st = getStatusDot(item.estado_registro);
                const formattedId = `#${String(item.nro_relevamiento ?? item.id).padStart(4, '0')}`;

                return (
                  <div
                    key={item.id}
                    className="sheet-item-card"
                    onClick={() => onSelectLote(item)}
                  >
                    <div className="sheet-item-header">
                      <span className="sheet-item-id">{formattedId}</span>
                      <span
                        className="sheet-item-status-pill"
                        style={{ color: st.color, background: `${st.color}15`, borderColor: `${st.color}30` }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color }} />
                        {st.label}
                      </span>
                    </div>

                    <div className="sheet-item-address">
                      {item.direccion || item.nombre || 'Sin dirección registrada'}
                    </div>

                    <div className="sheet-item-footer">
                      <span className="sheet-item-district">{item.distrito || 'SANTA FE'}</span>
                      {item.patrimonio && (
                        <span className="sheet-item-patrimonio">★ PATRIMONIO</span>
                      )}
                      <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '11.5px', fontWeight: 600 }}>
                        {300 + ((item.id * 17) % 250)} m²
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px', fontSize: '14px' }}>›</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'resumen' && (
          <div className="sheet-resumen-container">
            {/* KPI 1 */}
            <div className="sheet-kpi-card" style={{ borderLeft: '3px solid var(--accent)' }}>
              <div className="kpi-head">
                <span className="lbl">total relevamientos</span>
                <span className="badge" style={{ color: 'var(--accent)', borderColor: 'rgba(239, 123, 69, 0.3)', background: 'rgba(239, 123, 69, 0.08)' }}>
                  ● activo
                </span>
              </div>
              <div className="kpi-num" style={{ color: 'var(--accent)' }}>{totalCount}</div>
              <div className="kpi-strong">100% georreferenciados</div>
              <div className="kpi-sub">inmuebles monitoreados en la ciudad</div>
            </div>

            {/* KPI 2 */}
            <div className="sheet-kpi-card" style={{ borderLeft: '3px solid #38bdf8' }}>
              <div className="kpi-head">
                <span className="lbl">distrito con más casos</span>
                <span className="badge" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.08)' }}>
                  193 casos
                </span>
              </div>
              <div className="kpi-num" style={{ color: '#38bdf8' }}>CENTRO</div>
              <div className="kpi-strong">50.4% del inventario</div>
              <div className="kpi-sub">sobre 8 distritos catastrales</div>
            </div>

            {/* KPI 3 */}
            <div className="sheet-kpi-card" style={{ borderLeft: '3px solid var(--amber)' }}>
              <div className="kpi-head">
                <span className="lbl">patrimonio histórico</span>
                <span className="badge" style={{ color: 'var(--amber)', borderColor: 'rgba(232, 171, 66, 0.3)', background: 'rgba(232, 171, 66, 0.08)' }}>
                  interés cultural
                </span>
              </div>
              <div className="kpi-num" style={{ color: 'var(--amber)' }}>44</div>
              <div className="kpi-strong">Bajo protección patrimonial</div>
              <div className="kpi-sub">edificaciones con valor histórico</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
