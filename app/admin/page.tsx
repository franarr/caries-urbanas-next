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

  // Consulta de todos los lotes de la base de datos para la vista de mapa
  const { data: allMapItems } = useQuery({
    queryKey: ['admin-all-map-items'],
    queryFn: async () => {
      const res = await fetch('https://cariesbackend-production.up.railway.app/api/public/inmuebles.geojson');
      const geojson = await res.json();
      return (geojson.features || []).map((f: any) => ({
        id: f.id,
        nro_relevamiento: f.properties.nro_relevamiento,
        tipo: f.properties.tipo,
        nombre: f.properties.nombre,
        direccion: f.properties.direccion,
        distrito: f.properties.distrito,
        estado_registro: f.properties.estado_registro || 'carga',
        patrimonio: f.properties.patrimonio || false,
        lat: f.geometry?.coordinates ? f.geometry.coordinates[1] : null,
        lng: f.geometry?.coordinates ? f.geometry.coordinates[0] : null,
        actualizado_en: f.properties.actualizado_en || new Date().toISOString(),
      }));
    },
    staleTime: 1000 * 60 * 10,
  });

  const items = relevamientosData?.items || [];
  const mapItems = allMapItems || items;

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
            items={mapItems}
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
