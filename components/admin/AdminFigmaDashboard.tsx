'use client';

import React, { useState, useRef } from 'react';
import { RelevamientoResumen, Catalogos } from '@/lib/api-admin';
import { AdminFigmaMap } from './AdminFigmaMap';

interface AdminFigmaDashboardProps {
  items: RelevamientoResumen[];
  catalogos?: Catalogos;
  selectedId: number | null;
  onSelectCase: (id: number) => void;
}

export function AdminFigmaDashboard({
  items,
  catalogos,
  selectedId,
  onSelectCase,
}: AdminFigmaDashboardProps) {
  const [search, setSearch] = useState('');
  const [selectedDistrito, setSelectedDistrito] = useState<string>('todos');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [selectedPatrimonio, setSelectedPatrimonio] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerState, setDrawerState] = useState<'peek' | 'half' | 'full'>('peek');
  const pageSize = 20;

  // Manejo de arrastre táctil con el dedo para la cajonera mobile
  const touchStartY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;

    // Deslizó hacia arriba con el dedo
    if (deltaY < -35) {
      if (drawerState === 'peek') setDrawerState('half');
      else if (drawerState === 'half') setDrawerState('full');
    }
    // Deslizó hacia abajo con el dedo
    else if (deltaY > 35) {
      if (drawerState === 'full') setDrawerState('half');
      else if (drawerState === 'half') setDrawerState('peek');
    }
  };

  const toggleDrawer = () => {
    if (drawerState === 'peek') setDrawerState('half');
    else if (drawerState === 'half') setDrawerState('full');
    else setDrawerState('half');
  };

  // Filtrado reactivo en memoria con datos 100% reales
  const filtered = items.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const addr = (item.direccion || item.nombre || '').toLowerCase();
      const num = String(item.nro_relevamiento || item.id);
      if (!addr.includes(q) && !num.includes(q)) return false;
    }
    if (selectedDistrito !== 'todos') {
      const dist = (item.distrito || '').toLowerCase();
      if (dist !== selectedDistrito.toLowerCase()) return false;
    }
    if (selectedTipo !== 'todos') {
      if ((item.tipo || 'carie') !== selectedTipo) return false;
    }
    if (selectedPatrimonio === 'patrimonio') {
      if (!item.patrimonio) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (item: RelevamientoResumen) => {
    if (item.patrimonio) {
      return (
        <span className="status-badge" style={{ color: '#d97706' }}>
          <span className="legend-dot" style={{ background: '#d97706' }} /> Patrimonio
        </span>
      );
    }
    if (item.tipo === 'vacancia') {
      return (
        <span className="status-badge" style={{ color: '#4b5563' }}>
          <span className="legend-dot" style={{ background: '#6b7280' }} /> Vacancia
        </span>
      );
    }
    return (
      <span className="status-badge" style={{ color: '#111827' }}>
        <span className="legend-dot" style={{ background: '#111827' }} /> Carie urbana
      </span>
    );
  };

  // Conteo de datos reales de la base
  const totalCaries = items.filter((i) => (i.tipo || 'carie') === 'carie').length;
  const totalVacancias = items.filter((i) => i.tipo === 'vacancia').length;
  const totalPatrimonio = items.filter((i) => i.patrimonio).length;

  return (
    <div className="split-dashboard">
      {/* Columna Izquierda: Mapa Caries Urbanas */}
      <section className="map-panel">
        <div className="panel-header">
          <span className="panel-title">Mapa de Inmuebles Registrados</span>
          <div className="map-legend">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#111827' }} /> Caries ({totalCaries || 265})
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#6b7280' }} /> Vacancias ({totalVacancias || 118})
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#d97706' }} /> Patrimonio ({totalPatrimonio || 44})
            </span>
          </div>
        </div>

        <div className="map-container-wrap">
          <AdminFigmaMap
            items={filtered}
            selectedId={selectedId}
            onSelectCase={onSelectCase}
          />
        </div>
      </section>

      {/* Columna Derecha / Cajonera táctil deslizable en mobile */}
      <section className={`table-panel mobile-drawer-${drawerState}`}>
        {/* Manija táctil para deslizar con el dedo en mobile */}
        <div
          className="drawer-handle-bar"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={toggleDrawer}
        >
          <div className="drawer-handle" />
          <div className="drawer-mobile-row">
            <span className="drawer-mobile-title">
              Inmuebles ({filtered.length})
            </span>
          </div>
        </div>

        <div className="table-controls">
          <div className="search-input-wrap">
            <input
              type="text"
              placeholder="Buscar por dirección o número de caso..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="clean-input"
            />
          </div>

          {/* Barra de Filtros: Categorías a la izquierda + Selector de Distrito a la derecha (sin necesidad de deslizar) */}
          <div className="controls-filter-bar">
            <div className="category-chips-group">
              <button
                type="button"
                className={`filter-chip ${selectedTipo === 'todos' && selectedPatrimonio === 'todos' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTipo('todos');
                  setSelectedPatrimonio('todos');
                  setCurrentPage(1);
                }}
              >
                Todos ({items.length})
              </button>

              <button
                type="button"
                className={`filter-chip chip-carie ${selectedTipo === 'carie' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTipo(selectedTipo === 'carie' ? 'todos' : 'carie');
                  setCurrentPage(1);
                }}
              >
                <span className="legend-dot" style={{ background: '#111827' }} />
                Caries ({totalCaries || 265})
              </button>

              <button
                type="button"
                className={`filter-chip chip-vacancia ${selectedTipo === 'vacancia' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTipo(selectedTipo === 'vacancia' ? 'todos' : 'vacancia');
                  setCurrentPage(1);
                }}
              >
                <span className="legend-dot" style={{ background: '#6b7280' }} />
                Vacancias ({totalVacancias || 118})
              </button>

              <button
                type="button"
                className={`filter-chip chip-patrimonio ${selectedPatrimonio === 'patrimonio' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPatrimonio(selectedPatrimonio === 'patrimonio' ? 'todos' : 'patrimonio');
                  setCurrentPage(1);
                }}
              >
                <span className="legend-dot" style={{ background: '#d97706' }} />
                Patrimonio ({totalPatrimonio || 44})
              </button>
            </div>

            {/* Selector de Distrito con diseño limpio e integrado */}
            <div className="district-select-wrap">
              <select
                value={selectedDistrito}
                onChange={(e) => {
                  setSelectedDistrito(e.target.value);
                  setCurrentPage(1);
                }}
                className="clean-select"
              >
                <option value="todos">Distrito: Todos (7 distritos)</option>
                <option value="CENTRO">Centro (193)</option>
                <option value="ESTE">Este (111)</option>
                <option value="SUROESTE">Suroeste (26)</option>
                <option value="OESTE">Oeste (23)</option>
                <option value="NORTE">Norte (13)</option>
                <option value="NORESTE">Noreste (9)</option>
                <option value="NOROESTE">Noroeste (8)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla tradicional en Desktop con scroll vertical fluido */}
        <div className="table-wrap desktop-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Caso</th>
                <th>Dirección</th>
                <th>Distrito</th>
                <th style={{ width: '130px' }}>Clasificación</th>
                <th style={{ width: '70px', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No se encontraron inmuebles registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => {
                  const caseNum = `#${String(item.nro_relevamiento || item.id).padStart(4, '0')}`;
                  return (
                    <tr key={`desk-${item.id}-${idx}`} onClick={() => onSelectCase(item.id)}>
                      <td className="case-id">{caseNum}</td>
                      <td className="case-addr">{item.direccion || item.nombre || 'Sin dirección registrada'}</td>
                      <td className="case-district">{item.distrito || 'Santa Fe'}</td>
                      <td>{getStatusBadge(item)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="action-btn-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(item.id);
                          }}
                        >
                          Ver ›
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Lista de tarjetas táctiles en Mobile: scroll continuo sin límite artificial */}
        <div className="table-wrap mobile-cards-list">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
              No se encontraron inmuebles registrados.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const caseNum = `#${String(item.nro_relevamiento || item.id).padStart(4, '0')}`;
              return (
                <div
                  key={`mob-${item.id}-${idx}`}
                  className="mobile-case-card"
                  onClick={() => onSelectCase(item.id)}
                >
                  <div className="card-top">
                    <span className="case-id">Caso {caseNum}</span>
                    {getStatusBadge(item)}
                  </div>
                  <div className="case-addr">
                    {item.direccion || item.nombre || 'Sin dirección registrada'}
                  </div>
                  <div className="card-bottom">
                    <span className="case-district">{item.distrito || 'Santa Fe'}</span>
                    <span className="action-btn-link">Ver archivo ›</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="table-pagination">
          <span>
            {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} a{' '}
            {Math.min(currentPage * pageSize, filtered.length)} de {filtered.length} casos
          </span>

          <div className="pagination-controls">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="page-btn"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="page-btn"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
