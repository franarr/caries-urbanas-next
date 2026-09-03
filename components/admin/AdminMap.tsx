'use client';

import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { RelevamientoResumen } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';

// Asegurar que el worker estático resuelva bien en Turbopack
maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

interface AdminMapProps {
  items: RelevamientoResumen[];
}

export function AdminMap({ items }: AdminMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { selectedId, hoveredId, selectRelevamiento } = useAdminStore();

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-60.700, -31.630],
      zoom: 12.5,
      minZoom: 10,
      maxZoom: 18,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      // Fuente de datos de los relevamientos de la página actual
      map.addSource('admin-relevamientos', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Capa de círculos
      map.addLayer({
        id: 'admin-points',
        type: 'circle',
        source: 'admin-relevamientos',
        paint: {
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            9,
            ['boolean', ['feature-state', 'hovered'], false],
            8,
            6
          ],
          'circle-color': [
            'match',
            ['get', 'estado_registro'],
            'en_revision', '#F9A825',
            'confirmada', '#34A853',
            'eliminada', '#D93025',
            '#E85D26' // default: carga
          ],
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            3,
            ['boolean', ['feature-state', 'hovered'], false],
            2,
            1
          ],
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.9,
        },
      });

      // Eventos sobre los pines
      map.on('click', 'admin-points', (e) => {
        if (e.features && e.features[0]) {
          const id = e.features[0].properties?.id;
          if (id) selectRelevamiento(Number(id));
        }
      });

      map.on('mouseenter', 'admin-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'admin-points', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [selectRelevamiento]);

  // Actualizar datos del mapa cuando cambian los items
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const validItems = items.filter((i) => i.lat != null && i.lng != null);

    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: validItems.map((item) => ({
        type: 'Feature',
        id: item.id,
        geometry: {
          type: 'Point',
          coordinates: [item.lng!, item.lat!],
        },
        properties: {
          id: item.id,
          nro: item.nro_relevamiento,
          direccion: item.direccion || item.nombre,
          distrito: item.distrito,
          estado_registro: item.estado_registro,
        },
      })),
    };

    const updateSource = () => {
      const source = map.getSource('admin-relevamientos') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(geojsonData);
      }
    };

    if (map.isStyleLoaded()) {
      updateSource();
    } else {
      map.once('load', updateSource);
    }
  }, [items]);

  // Manejar hover y selección en el mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    items.forEach((item) => {
      map.setFeatureState(
        { source: 'admin-relevamientos', id: item.id },
        {
          selected: item.id === selectedId,
          hovered: item.id === hoveredId,
        }
      );
    });
  }, [items, selectedId, hoveredId]);

  // Volar al lote seleccionado
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const target = items.find((i) => i.id === selectedId);
    if (target && target.lat != null && target.lng != null) {
      map.flyTo({
        center: [target.lng, target.lat],
        zoom: 15.5,
        duration: 900,
      });
    }
  }, [selectedId, items]);

  // Redimensionar al cambiar vista
  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.resize();
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(26, 26, 46, 0.85)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.6875rem',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        Lotes en página actual ({items.filter((i) => i.lat != null).length} en mapa)
      </div>
    </div>
  );
}
