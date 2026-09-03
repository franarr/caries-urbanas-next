'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCatalogos, fetchRelevamientos } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';
import FilterBar from '@/components/admin/FilterBar';
import { RelevamientoList } from '@/components/admin/RelevamientoList';
import { AdminMap } from '@/components/admin/AdminMap';
import { SidePeek } from '@/components/admin/SidePeek';
import { KpiBar } from '@/components/admin/KpiBar';
import { Map, List } from 'lucide-react';

export default function AdminDashboardPage() {
  const { filtros, mobileView, setMobileView } = useAdminStore();

  // Consulta de catálogos (distritos, vecinales, tipos)
  const { data: catalogos } = useQuery({
    queryKey: ['admin-catalogos'],
    queryFn: fetchCatalogos,
    staleTime: 1000 * 60 * 10, // 10 min
  });

  // Consulta paginada y filtrada de relevamientos
  const { data: relevamientosData, isLoading, isError } = useQuery({
    queryKey: ['admin-relevamientos', filtros],
    queryFn: () => fetchRelevamientos(filtros),
    staleTime: 1000 * 60 * 2, // 2 min
  });

  const items = relevamientosData?.items || [];

  return (
    <div className="admin-main">
      {/* Panel Izquierdo: Mapa */}
      <section className={`admin-map-pane ${mobileView === 'map' ? 'mobile-active' : ''}`} aria-label="Mapa Operativo">
        <AdminMap items={items} />
      </section>

      {/* Panel Derecho: Datos y Listado */}
      <section className={`admin-data-pane ${mobileView === 'list' ? 'mobile-active' : ''}`} aria-label="Listado de Inmuebles">
        <FilterBar catalogos={catalogos} />
        
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <RelevamientoList
            data={relevamientosData}
            isLoading={isLoading}
            isError={isError}
          />
        </div>

        <KpiBar totalItems={relevamientosData?.total} />
      </section>

      {/* Ficha lateral detallada (Side-Peek) */}
      <SidePeek />

      {/* Botón flotante para alternar vista en celulares */}
      <div className="mobile-view-toggle">
        <button
          className={mobileView === 'list' ? 'active' : ''}
          onClick={() => setMobileView('list')}
        >
          <List size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Listado
        </button>
        <button
          className={mobileView === 'map' ? 'active' : ''}
          onClick={() => setMobileView('map')}
        >
          <Map size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Mapa
        </button>
      </div>
    </div>
  );
}
