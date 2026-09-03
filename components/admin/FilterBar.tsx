'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Catalogos } from '@/lib/api-admin';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  catalogos: Catalogos | undefined;
  totalCount?: number;
}

export default function FilterBar({ catalogos, totalCount }: FilterBarProps) {
  const { filtros, setFiltro } = useAdminStore();
  const [query, setQuery] = useState(filtros.q);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltro('q', query);
  };

  const statusTabs = [
    { key: '', label: 'Todos' },
    { key: 'carga', label: 'En carga' },
    { key: 'en_revision', label: 'Revisión' },
    { key: 'confirmada', label: 'Confirmadas' },
  ];

  return (
    <div className="glass-header">
      {/* Search Input con icono Apple style */}
      <form onSubmit={handleSearchSubmit} className="glass-search-wrap">
        <Search size={15} className="glass-search-icon" />
        <input
          type="text"
          className="glass-search-input"
          placeholder="Buscar lote, calle o número..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === '') setFiltro('q', '');
          }}
        />
        {query && (
          <button
            type="button"
            className="glass-search-clear"
            onClick={() => {
              setQuery('');
              setFiltro('q', '');
            }}
          >
            <X size={12} />
          </button>
        )}
      </form>

      {/* iOS Segmented Control */}
      <div className="ios-segmented">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`ios-segment-btn ${filtros.estado === tab.key ? 'active' : ''}`}
            onClick={() => setFiltro('estado', tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Distrito picker & Contador */}
      <div className="glass-district-row">
        <select
          className="glass-select"
          value={filtros.distrito_id ?? ''}
          onChange={(e) => setFiltro('distrito_id', e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Todos los distritos</option>
          {catalogos?.distritos?.map((d) => (
            <option key={d.id} value={d.id}>
              Distrito {d.nombre}
            </option>
          ))}
        </select>

        {totalCount !== undefined && (
          <span className="glass-count-chip">
            {totalCount} {totalCount === 1 ? 'inmueble' : 'inmuebles'}
          </span>
        )}
      </div>
    </div>
  );
}
