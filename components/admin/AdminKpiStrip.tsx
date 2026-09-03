'use client';

import React from 'react';

interface AdminKpiStripProps {
  totalCount?: number;
}

export function AdminKpiStrip({ totalCount = 383 }: AdminKpiStripProps) {
  return (
    <div className="kpi-strip">
      <div className="kpi-card">
        <div className="kpi-head">
          <span className="lbl">total relevamientos</span>
          <span className="badge up">↑ +18</span>
        </div>
        <div className="kpi-num">{totalCount}</div>
        <div className="kpi-strong">Subiendo este mes</div>
        <div className="kpi-sub">casos registrados en total</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-head">
          <span className="lbl">distrito con más casos</span>
          <span className="badge">193 casos</span>
        </div>
        <div className="kpi-num">CENTRO</div>
        <div className="kpi-strong">50% del total</div>
        <div className="kpi-sub">sobre 8 distritos relevados</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-head">
          <span className="lbl">en tratamiento</span>
          <span className="badge down">↓ −4</span>
        </div>
        <div className="kpi-num">18</div>
        <div className="kpi-strong">Bajando levemente</div>
        <div className="kpi-sub">casos con intervención activa</div>
      </div>
    </div>
  );
}
