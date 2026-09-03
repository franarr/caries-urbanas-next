'use client';

import React from 'react';

interface AdminKpiStripProps {
  totalCount?: number;
}

export function AdminKpiStrip({ totalCount = 383 }: AdminKpiStripProps) {
  return (
    <div className="kpi-strip">
      {/* KPI 1: Total Relevamientos */}
      <div className="kpi-card" style={{ borderTop: '2px solid var(--accent)' }}>
        <div className="kpi-head">
          <span className="lbl">total relevamientos</span>
          <span
            className="badge"
            style={{
              color: 'var(--accent)',
              borderColor: 'rgba(239, 123, 69, 0.3)',
              background: 'rgba(239, 123, 69, 0.08)',
            }}
          >
            ● base activa
          </span>
        </div>
        <div className="kpi-num" style={{ color: 'var(--accent)' }}>
          {totalCount}
        </div>
        <div className="kpi-strong">100% georreferenciados</div>
        <div className="kpi-sub">inmuebles monitoreados en Santa Fe</div>
      </div>

      {/* KPI 2: Distrito con Mayor Densidad */}
      <div className="kpi-card" style={{ borderTop: '2px solid #38bdf8' }}>
        <div className="kpi-head">
          <span className="lbl">distrito con más casos</span>
          <span
            className="badge"
            style={{
              color: '#38bdf8',
              borderColor: 'rgba(56, 189, 248, 0.3)',
              background: 'rgba(56, 189, 248, 0.08)',
            }}
          >
            193 casos
          </span>
        </div>
        <div className="kpi-num" style={{ color: '#38bdf8' }}>
          CENTRO
        </div>
        <div className="kpi-strong">50.4% del inventario</div>
        <div className="kpi-sub">sobre 8 distritos catastrales</div>
      </div>

      {/* KPI 3: Patrimonio Histórico */}
      <div className="kpi-card" style={{ borderTop: '2px solid var(--amber)' }}>
        <div className="kpi-head">
          <span className="lbl">patrimonio histórico</span>
          <span
            className="badge"
            style={{
              color: 'var(--amber)',
              borderColor: 'rgba(232, 171, 66, 0.3)',
              background: 'rgba(232, 171, 66, 0.08)',
            }}
          >
            interés cultural
          </span>
        </div>
        <div className="kpi-num" style={{ color: 'var(--amber)' }}>
          44
        </div>
        <div className="kpi-strong">Bajo protección patrimonial</div>
        <div className="kpi-sub">edificaciones de valor histórico</div>
      </div>
    </div>
  );
}
