'use client';

import { useAdminStore } from '@/lib/store';
import { ListadoParams, Catalogos } from '@/lib/api-admin';
import { Search, X, Filter } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  catalogos: Catalogos | undefined;
}

export default function FilterBar({ catalogos }: FilterBarProps) {
  const { filtros, setFiltro, resetFiltros } = useAdminStore();
  const [searchValue, setSearchValue] = useState(filtros.q);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltro('q', searchValue);
  };

  const hasActiveFilters = filtros.estado || filtros.tipo || filtros.distrito_id || filtros.q;

  return (
    <div className="admin-filter-bar">
      <form onSubmit={handleSearch} className="admin-filter-search-form">
        <Search size={16} className="admin-filter-search-icon" />
        <input
          type="text"
          className="admin-filter-input"
          placeholder="Buscar dirección, nombre, nro..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <button type="button" className="admin-filter-clear" onClick={() => { setSearchValue(''); setFiltro('q', ''); }}>
            <X size={14} />
          </button>
        )}
      </form>

      <button
        className="admin-filter-toggle-mobile"
        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
      >
        <Filter size={16} />
        {hasActiveFilters && <span className="admin-filter-dot" />}
      </button>

      <div className={`admin-filter-selects ${mobileFiltersOpen ? 'mobile-open' : ''}`}>
        <select
          className="admin-filter-select"
          value={filtros.estado}
          onChange={(e) => setFiltro('estado', e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="carga">En carga</option>
          <option value="en_revision">En revisión</option>
          <option value="confirmada">Confirmada</option>
          <option value="eliminada">Eliminada</option>
        </select>

        <select
          className="admin-filter-select"
          value={filtros.tipo}
          onChange={(e) => setFiltro('tipo', e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {catalogos?.tipos_relevamiento?.map((t) => (
            <option key={t.id} value={t.nombre}>{t.nombre}</option>
          )) || (
            <>
              <option value="carie">carie</option>
              <option value="vacancia">vacancia</option>
            </>
          )}
        </select>

        <select
          className="admin-filter-select"
          value={filtros.distrito_id ?? ''}
          onChange={(e) => setFiltro('distrito_id', e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Todos los distritos</option>
          {catalogos?.distritos?.map((d) => (
            <option key={d.id} value={d.id}>{d.nombre}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className="admin-filter-reset" onClick={() => { resetFiltros(); setSearchValue(''); }}>
            <X size={14} /> Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
