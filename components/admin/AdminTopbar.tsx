'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Catalogos } from '@/lib/api-admin';

interface AdminTopbarProps {
  currentTab: 'relevamientos' | 'mapa';
  catalogos: Catalogos | undefined;
}

export function AdminTopbar({ currentTab, catalogos }: AdminTopbarProps) {
  const { filtros, setFiltro } = useAdminStore();
  const [searchVal, setSearchVal] = useState(filtros.q);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    setFiltro('q', val);
  };

  return (
    <div className="topbar">
      <span className="crumb">caries-urbanas /</span>
      <h1>{currentTab}</h1>
      <div className="spacer"></div>

      {/* Selector de Distrito */}
      <div className="filter-select">
        <select
          value={filtros.distrito_id ?? ''}
          onChange={(e) => setFiltro('distrito_id', e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">distrito: todos</option>
          {catalogos?.distritos?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre.toLowerCase()}
            </option>
          ))}
        </select>
        <span>▾</span>
      </div>

      {/* Selector de Estado */}
      <div className="filter-select">
        <select
          value={filtros.estado}
          onChange={(e) => setFiltro('estado', e.target.value)}
        >
          <option value="">estado: todos</option>
          <option value="carga">sin tratar (en carga)</option>
          <option value="en_revision">en tratamiento</option>
          <option value="confirmada">tratado (confirmada)</option>
          <option value="eliminada">baja</option>
        </select>
        <span>▾</span>
      </div>

      {/* Caja de Búsqueda */}
      <div className="search-box">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#97979d" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="buscar dirección…"
          value={searchVal}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  );
}
