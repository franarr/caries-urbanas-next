'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCatalogos, fetchRelevamientos } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { AdminKpiStrip } from '@/components/admin/AdminKpiStrip';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFichaModal } from '@/components/admin/AdminFichaModal';
import { AdminMapFull } from '@/components/admin/AdminMapFull';

export default function AdminPage() {
  const [currentTab, setCurrentTab] = useState<'relevamientos' | 'mapa'>('relevamientos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { filtros } = useAdminStore();

  // Catálogos oficiales de distritos y tipos
  const { data: catalogos } = useQuery({
    queryKey: ['admin-catalogos'],
    queryFn: fetchCatalogos,
    staleTime: 1000 * 60 * 10,
  });

  // Relevamientos filtrados y paginados
  const { data: relevamientosData, isLoading } = useQuery({
    queryKey: ['admin-relevamientos', filtros],
    queryFn: () => fetchRelevamientos(filtros),
    staleTime: 1000 * 60 * 2,
  });

  const items = relevamientosData?.items || [];

  return (
    <div className="admin-app">
      {/* Sidebar */}
      <AdminSidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Container */}
      <main className="main">
        {/* Topbar */}
        <AdminTopbar currentTab={currentTab} catalogos={catalogos} />

        {/* Tab: Relevamientos (Tabla + KPIs) */}
        {currentTab === 'relevamientos' && (
          <>
            <AdminKpiStrip totalCount={relevamientosData?.total} />
            <AdminTable
              data={relevamientosData}
              isLoading={isLoading}
              onOpenModal={() => setIsModalOpen(true)}
            />
          </>
        )}

        {/* Tab: Mapa Completo */}
        {currentTab === 'mapa' && (
          <AdminMapFull
            items={items}
            onSelectLote={() => setIsModalOpen(true)}
          />
        )}
      </main>

      {/* Modal Ficha Completa */}
      <AdminFichaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
