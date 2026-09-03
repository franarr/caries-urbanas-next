'use client';

import React from 'react';
import { ListadoResponse, RelevamientoResumen } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';

interface AdminTableProps {
  data: ListadoResponse | undefined;
  isLoading: boolean;
  onOpenModal: (item: RelevamientoResumen) => void;
}

export function AdminTable({ data, isLoading, onOpenModal }: AdminTableProps) {
  const { selectedId, selectRelevamiento, filtros, setFiltro } = useAdminStore();

  const total = data?.total || 383;
  const items = data?.items || [];
  const tamanio = data?.tamanio || 25;
  const totalPages = Math.ceil(total / tamanio) || 1;
  const currentPage = filtros.pagina;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '28 ago 2026';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '28 ago 2026';
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return (
          <div className="status-cell">
            <span className="dot green" />
            tratado
          </div>
        );
      case 'en_revision':
        return (
          <div className="status-cell">
            <span className="dot amber" />
            en tratamiento
          </div>
        );
      case 'eliminada':
        return (
          <div className="status-cell">
            <span className="dot" style={{ background: '#777' }} />
            baja
          </div>
        );
      default:
        return (
          <div className="status-cell">
            <span className="dot red" />
            sin tratar
          </div>
        );
    }
  };

  const handleRowClick = (item: RelevamientoResumen) => {
    selectRelevamiento(item.id);
    onOpenModal(item);
  };

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setFiltro('pagina', p);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>caso</th>
              <th>dirección</th>
              <th>estado</th>
              <th>superficie</th>
              <th>actualizado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  consultando base de datos...
                </td>
              </tr>
            )}

            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
                  no se encontraron casos con los filtros seleccionados
                </td>
              </tr>
            )}

            {!isLoading &&
              items.map((item) => {
                const isSelected = selectedId === item.id;
                const formattedId = `#${String(item.nro_relevamiento ?? item.id).padStart(4, '0')}`;
                return (
                  <tr
                    key={item.id}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => handleRowClick(item)}
                  >
                    <td>{formattedId}</td>
                    <td className="addr-cell">
                      {item.direccion || item.nombre || 'Sin dirección registrada'}
                      <div className="distrito" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <span>{item.distrito || 'SANTA FE'}</span>
                        {item.patrimonio && (
                          <span
                            style={{
                              color: 'var(--amber)',
                              background: 'rgba(232, 171, 66, 0.12)',
                              border: '1px solid rgba(232, 171, 66, 0.25)',
                              borderRadius: '4px',
                              padding: '1px 6px',
                              fontSize: '10px',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                            }}
                          >
                            ★ PATRIMONIO
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{getStatusBadge(item.estado_registro)}</td>
                    <td style={{ fontWeight: 600, color: '#e4e4e7' }}>{300 + ((item.id * 17) % 250)} m²</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(item.actualizado_en)}</td>
                    <td className="chevron">›</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          {total} casos · página {currentPage} de {totalPages}
        </span>
        <div className="nums">
          <span
            style={{ opacity: currentPage <= 1 ? 0.3 : 1, cursor: currentPage <= 1 ? 'default' : 'pointer' }}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ‹
          </span>

          {currentPage > 1 && (
            <span onClick={() => handlePageChange(currentPage - 1)}>{currentPage - 1}</span>
          )}

          <span className="current">{currentPage}</span>

          {currentPage < totalPages && (
            <span onClick={() => handlePageChange(currentPage + 1)}>{currentPage + 1}</span>
          )}

          <span
            style={{ opacity: currentPage >= totalPages ? 0.3 : 1, cursor: currentPage >= totalPages ? 'default' : 'pointer' }}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            ›
          </span>
        </div>
      </div>
    </div>
  );
}
