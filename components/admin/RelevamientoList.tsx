'use client';

import React from 'react';
import { ListadoResponse } from '@/lib/api-admin';
import { RelevamientoRow } from '@/components/admin/RelevamientoRow';
import { useAdminStore } from '@/lib/store';
import { ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';

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
      <div className="admin-list" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.875rem' }}>Consultando base de datos...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="admin-list" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '24px' }}>
        <div style={{ textAlign: 'center', color: 'var(--red)' }}>
          <p style={{ fontWeight: 600, marginBottom: '6px' }}>Error al conectar con el backend</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No pudimos cargar los relevamientos. Verificá tu sesión o la conexión a la API.</p>
        </div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="admin-list" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '24px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Inbox size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px' }}>Sin resultados</p>
          <p style={{ fontSize: '0.8125rem' }}>No hay inmuebles que coincidan con los filtros aplicados.</p>
        </div>
      </div>
    );
  }

  // Generar números de página visibles
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="admin-list">
        {data.items.map((item) => (
          <RelevamientoRow key={item.id} item={item} />
        ))}
      </div>

      <div className="admin-pagination">
        <span className="admin-pagination-info">
          {data.total} relevamientos · Pág. {currentPage} de {totalPages}
        </span>

        <div className="admin-pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Página anterior"
          >
            <ChevronLeft size={14} />
          </button>

          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                className={currentPage === p ? 'active' : ''}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            ) : (
              <span key={idx} style={{ padding: '0 6px', alignSelf: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {p}
              </span>
            )
          )}

          <button
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
