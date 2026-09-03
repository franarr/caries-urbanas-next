'use client';

import React from 'react';
import { ListadoResponse } from '@/lib/api-admin';
import { RelevamientoRow } from '@/components/admin/RelevamientoRow';
import { useAdminStore } from '@/lib/store';
import { ChevronLeft, ChevronRight, Loader2, SearchX } from 'lucide-react';

interface RelevamientoListProps {
  data: ListadoResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function RelevamientoList({ data, isLoading, isError }: RelevamientoListProps) {
  const { filtros, setFiltro } = useAdminStore();

  const totalPages = data ? Math.ceil(data.total / data.tamanio) : 1;
  const currentPage = filtros.pagina;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFiltro('pagina', newPage);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px', color: 'var(--text-muted)' }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cargando catálogo...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--red)' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Sin conexión con la base de datos</p>
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <SearchX size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>Sin coincidencias</p>
        <p style={{ fontSize: '0.75rem', marginTop: '2px' }}>Probá cambiando los filtros o la búsqueda.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="glass-list">
        {data.items.map((item) => (
          <RelevamientoRow key={item.id} item={item} />
        ))}
      </div>

      {/* Paginación compacta estilo iOS */}
      <div className="glass-pagination">
        <span>
          Pág. <strong>{currentPage}</strong> de {totalPages}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="glass-page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Página anterior"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            className="glass-page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Página siguiente"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
