'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCatalogos, fetchRelevamientos } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';
import FilterBar from '@/components/admin/FilterBar';
import { RelevamientoList } from '@/components/admin/RelevamientoList';
import { AdminMap } from '@/components/admin/AdminMap';
import { SidePeek } from '@/components/admin/SidePeek';

export default function AdminDashboardPage() {
  const { filtros } = useAdminStore();
  const [mobileMinimized, setMobileMinimized] = useState(false);

  // Consulta de catálogos oficiales
  const { data: catalogos } = useQuery({
    queryKey: ['admin-catalogos'],
    queryFn: fetchCatalogos,
    staleTime: 1000 * 60 * 10,
  });

  // Consulta paginada y filtrada de relevamientos
  const { data: relevamientosData, isLoading, isError } = useQuery({
    queryKey: ['admin-relevamientos', filtros],
    queryFn: () => fetchRelevamientos(filtros),
    staleTime: 1000 * 60 * 2,
  });

  const items = relevamientosData?.items || [];

  return (
    <div className="admin-viewport">
      {/* 1. Mapa Inmersivo a Pantalla Completa */}
      <div className="admin-map-canvas">
        <AdminMap items={items} />
      </div>

      {/* 2. Tarjeta Flotante Izquierda / Bottom Sheet en Mobile (Liquid Glass Drawer) */}
      <aside className={`admin-glass-drawer ${mobileMinimized ? 'minimized' : ''}`}>
        {/* Tirador táctil para móviles */}
        <div
          className="sheet-handle"
          onClick={() => setMobileMinimized(!mobileMinimized)}
          title="Alternar panel"
        />

        {/* Filtros segmentados estilo iOS y buscador */}
        <FilterBar catalogos={catalogos} totalCount={relevamientosData?.total} />

        {/* Listado en celda de vidrio líquido */}
        <RelevamientoList
          data={relevamientosData}
          isLoading={isLoading}
          isError={isError}
        />
      </aside>

      {/* 3. Ficha Flotante Derecha / Inspector de Lote (Liquid Glass Inspector) */}
      <SidePeek />
    </div>
  );
}
