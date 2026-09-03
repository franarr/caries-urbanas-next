'use client';

import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { RelevamientoResumen } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';

maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

interface AdminMapFullProps {
  items: RelevamientoResumen[];
  onSelectLote: (item: RelevamientoResumen) => void;
}

export function AdminMapFull({ items, onSelectLote }: AdminMapFullProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectLoteRef = useRef(onSelectLote);
  const itemsRef = useRef(items);
  const { selectedId } = useAdminStore();

  onSelectLoteRef.current = onSelectLote;
  itemsRef.current = items;

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-60.700, -31.630],
      zoom: 12.8,
      minZoom: 10,
      maxZoom: 18,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      // Fuente con todos los puntos
      map.addSource('full-relevamientos', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Capa de halo para punto seleccionado
      map.addLayer({
        id: 'full-points-glow',
        type: 'circle',
        source: 'full-relevamientos',
        paint: {
          'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 14, 0],
          'circle-color': '#ef7b45',
          'circle-opacity': 0.35,
          'circle-blur': 0.5,
        },
      });

      // Capa de círculos
      map.addLayer({
        id: 'full-points',
        type: 'circle',
        source: 'full-relevamientos',
        paint: {
          'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 8, 5.5],
          'circle-color': [
            'match',
            ['get', 'estado_registro'],
            'en_revision', '#e8ab42',
            'confirmada', '#4fd88a',
            'eliminada', '#777777',
            '#f0564a',
          ],
          'circle-stroke-width': ['case', ['boolean', ['feature-state', 'selected'], false], 2, 1],
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.95,
        },
      });

      // Click sobre punto
      map.on('click', 'full-points', (e) => {
        if (e.features && e.features[0]) {
          const id = e.features[0].properties?.id;
          const found = itemsRef.current.find((i) => i.id === id);
          if (found) {
            onSelectLoteRef.current(found);
          }
        }
      });

      map.on('mouseenter', 'full-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'full-points', () => {
        map.getCanvas().style.cursor = '';
      });

      // Cargar datos si items ya estaban disponibles
      updateSourceData(map, itemsRef.current);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Solo se ejecuta una vez al montar

  // Función helper para actualizar GeoJSON
  const updateSourceData = (map: maplibregl.Map, currentItems: RelevamientoResumen[]) => {
    const valid = currentItems.filter((i) => i.lat != null && i.lng != null);
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: valid.map((i) => ({
        type: 'Feature',
        id: i.id,
        geometry: { type: 'Point', coordinates: [i.lng!, i.lat!] },
        properties: {
          id: i.id,
          nro: i.nro_relevamiento,
          direccion: i.direccion || i.nombre,
          distrito: i.distrito,
          estado_registro: i.estado_registro,
        },
      })),
    };

    const src = map.getSource('full-relevamientos') as maplibregl.GeoJSONSource;
    if (src) src.setData(data);
  };

  // Actualizar datos sin destruir el mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      updateSourceData(map, items);
    } else {
      map.once('load', () => updateSourceData(map, items));
    }
  }, [items]);

  // Actualizar selección visual sin destruir el mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    items.forEach((item) => {
      map.setFeatureState(
        { source: 'full-relevamientos', id: item.id },
        { selected: item.id === selectedId }
      );
    });
  }, [items, selectedId]);

  // Volar hacia el lote seleccionado cuando cambia
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const fly = () => {
      const target = items.find((i) => i.id === selectedId);
      if (target && target.lat != null && target.lng != null) {
        map.flyTo({
          center: [target.lng, target.lat],
          zoom: 16.5,
          speed: 1.4,
          curve: 1.2,
          essential: true,
        });
      }
    };

    if (map.isStyleLoaded()) fly();
    else map.once('load', fly);
  }, [selectedId, items]);

  return (
    <div className="full-map-container">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
