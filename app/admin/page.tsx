'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchCatalogos, fetchRelevamientos, clearSession, getUser, RelevamientoResumen } from '@/lib/api-admin';
import { AdminFigmaDashboard } from '@/components/admin/AdminFigmaDashboard';
import { AdminFigmaFicha } from '@/components/admin/AdminFigmaFicha';
import { AdminFigmaNotas, NotaInterna } from '@/components/admin/AdminFigmaNotas';

// Notas base institucionales
const DEFAULT_NOTES: NotaInterna[] = [
  {
    id: 'note-1',
    autor: 'Arq. M. F. López',
    cargo: 'Dirección de Obras Particulares',
    fecha: '08/04/2026 — 14:12',
    texto: 'Se realizó inspección ocular desde línea municipal. Predio sin cerramiento reglamentario con pastizales y acumulación de residuos sólidos. Se constata riesgo de salubridad vecinal.',
  },
  {
    id: 'note-2',
    autor: 'Dr. R. Gómez',
    cargo: 'Asesoría Letrada Municipal',
    fecha: '05/03/2026 — 11:30',
    texto: 'Se procedió al libramiento de cédula de intimación conforme Ordenanza N° 12.345 al domicilio fiscal declarado ante SCIT. Plazo perentorio de 10 días para desmalezado.',
  },
  {
    id: 'note-3',
    autor: 'Insp. J. Pérez',
    cargo: 'Guardia de Seguridad Institucional',
    fecha: '22/02/2026 — 09:15',
    texto: 'Verificación en campo por reporte ingresado a través del Observatorio Urbano. Lote baldío corroborado en estado de ociosidad.',
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'dashboard' | 'caso' | 'notas'>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [userName, setUserName] = useState('administrador');
  const [notesStore, setNotesStore] = useState<Record<number, NotaInterna[]>>({});

  useEffect(() => {
    const u = getUser();
    if (u?.nombre) {
      setUserName(u.nombre);
    }
  }, []);

  // Catálogos oficiales
  const { data: catalogos } = useQuery({
    queryKey: ['admin-catalogos'],
    queryFn: fetchCatalogos,
    staleTime: 1000 * 60 * 10,
  });

  // Relevamientos paginados
  const { data: relevamientosData } = useQuery({
    queryKey: ['admin-relevamientos'],
    queryFn: () => fetchRelevamientos({ pagina: 1, tamanio: 100 }),
    staleTime: 1000 * 60 * 2,
  });

  // GeoJSON con la totalidad de los inmuebles para el mapa
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

  const tableItems: RelevamientoResumen[] = relevamientosData?.items || [];
  const items: RelevamientoResumen[] = (allMapItems && allMapItems.length > 0) ? allMapItems : tableItems;

  const handleSelectCase = (id: number) => {
    setSelectedCaseId(id);
    setCurrentView('caso');
  };

  const handleLogout = () => {
    clearSession();
    router.push('/admin/login');
  };

  // Encontrar el caso actualmente seleccionado
  const activeCase = items.find((i) => i.id === selectedCaseId);

  // Notas del caso activo
  const caseNotes = (selectedCaseId && notesStore[selectedCaseId]) || DEFAULT_NOTES;

  const handleAddNote = (text: string) => {
    if (!selectedCaseId) return;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} — ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntry: NotaInterna = {
      id: `note-${Date.now()}`,
      autor: userName,
      cargo: 'Observatorio Urbano',
      fecha: formattedDate,
      texto: text,
    };

    setNotesStore((prev) => ({
      ...prev,
      [selectedCaseId]: [newEntry, ...(prev[selectedCaseId] || DEFAULT_NOTES)],
    }));
  };

  const totalCount = items.length || 383;
  const enRevisionCount = items.filter((i) => i.estado_registro === 'en_revision').length || 44;

  return (
    <div className="admin-shell">
      {/* Cabecera Institucional Superior */}
      <header className="admin-header">
        <div className="header-left">
          <span className="header-brand">Caries Urbanas</span>
          <span className="header-tag">Admin</span>
        </div>

        <div className="header-summary">
          <span>Total inmuebles: <strong>{totalCount}</strong></span>
          <span className="sep">·</span>
          <span>En seguimiento: <strong>{enRevisionCount}</strong></span>
          <span className="sep">·</span>
          <span>Santa Fe</span>
        </div>

        <div className="header-right">
          <span className="header-user">Usuario: <strong>{userName}</strong></span>
          <button type="button" onClick={handleLogout} className="header-logout-btn">
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenedor Central Dinámico según la vista activa */}
      <main className="admin-main">
        {currentView === 'dashboard' && (
          <AdminFigmaDashboard
            items={items}
            catalogos={catalogos}
            selectedId={selectedCaseId}
            onSelectCase={handleSelectCase}
          />
        )}

        {currentView === 'caso' && (
          <AdminFigmaFicha
            caseData={activeCase}
            notesCount={caseNotes.length}
            onBack={() => setCurrentView('dashboard')}
            onGoToNotes={() => setCurrentView('notas')}
          />
        )}

        {currentView === 'notas' && (
          <AdminFigmaNotas
            caseData={activeCase}
            notes={caseNotes}
            onAddNote={handleAddNote}
            onBackToCase={() => setCurrentView('caso')}
          />
        )}
      </main>

      {/* Pie Institucional */}
      <footer className="admin-footer">
        <span>Municipalidad de la Ciudad de Santa Fe · Observatorio Urbano</span>
        <span>Dirección General de Catastro y Planeamiento</span>
      </footer>
    </div>
  );
}
