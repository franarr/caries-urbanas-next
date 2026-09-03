'use client';

import React, { useState } from 'react';
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
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtrado reactivo en memoria
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
    if (selectedEstado !== 'todos') {
      if (item.estado_registro !== selectedEstado) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (estado?: string) => {
    switch (estado) {
      case 'confirmada':
        return (
          <span className="status-badge" style={{ color: 'var(--status-green)' }}>
            <span className="legend-dot dot-green" /> Tratado
          </span>
        );
      case 'en_revision':
        return (
          <span className="status-badge" style={{ color: 'var(--status-amber)' }}>
            <span className="legend-dot dot-amber" /> En revisión
          </span>
        );
      default:
        return (
          <span className="status-badge" style={{ color: 'var(--status-red)' }}>
            <span className="legend-dot dot-red" /> Sin tratar
          </span>
        );
    }
  };

  return (
    <div className="split-dashboard">
      {/* Columna Izquierda: Mapa Caries Urbanas */}
      <section className="map-panel">
        <div className="panel-header">
          <span className="panel-title">Mapa Caries Urbanas</span>
          <div className="map-legend">
            <span className="legend-item">
              <span className="legend-dot dot-red" /> Sin tratar
            </span>
            <span className="legend-item">
              <span className="legend-dot dot-amber" /> En revisión
            </span>
            <span className="legend-item">
              <span className="legend-dot dot-green" /> Tratados
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

      {/* Columna Derecha: Buscador y Tabla */}
      <section className="table-panel">
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

          <div className="filters-row">
            <select
              value={selectedDistrito}
              onChange={(e) => {
                setSelectedDistrito(e.target.value);
                setCurrentPage(1);
              }}
              className="clean-select"
            >
              <option value="todos">Distrito: Todos</option>
              {catalogos?.distritos?.map((d) => (
                <option key={d.id} value={d.nombre}>
                  {d.nombre}
                </option>
              ))}
            </select>

            <select
              value={selectedEstado}
              onChange={(e) => {
                setSelectedEstado(e.target.value);
                setCurrentPage(1);
              }}
              className="clean-select"
            >
              <option value="todos">Estado: Todos</option>
              <option value="carga">Sin tratar</option>
              <option value="en_revision">En revisión</option>
              <option value="confirmada">Tratados</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Caso</th>
                <th>Dirección</th>
                <th>Distrito</th>
                <th style={{ width: '130px' }}>Estado</th>
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
                paginated.map((item) => {
                  const caseNum = `#${String(item.nro_relevamiento || item.id).padStart(4, '0')}`;
                  return (
                    <tr key={item.id} onClick={() => onSelectCase(item.id)}>
                      <td className="case-id">{caseNum}</td>
                      <td className="case-addr">{item.direccion || item.nombre || 'Sin dirección registrada'}</td>
                      <td className="case-district">{item.distrito || 'Santa Fe'}</td>
                      <td>{getStatusBadge(item.estado_registro)}</td>
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

        <div className="table-pagination">
          <span>
            Mostrando {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} a{' '}
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
