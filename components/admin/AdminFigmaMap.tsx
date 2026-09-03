'use client';

import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RelevamientoResumen } from '@/lib/api-admin';

// Worker para Turbopack
maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

interface AdminFigmaMapProps {
  items: RelevamientoResumen[];
  selectedId: number | null;
  onSelectCase: (id: number) => void;
}

export function AdminFigmaMap({ items, selectedId, onSelectCase }: AdminFigmaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onSelectCase);
  const itemsRef = useRef(items);

  useEffect(() => {
    onSelectRef.current = onSelectCase;
    itemsRef.current = items;
  }, [onSelectCase, items]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Mapa limpio estilo Carto Positron para coincidir con la estética clara de Figma
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [-60.700, -31.635],
      zoom: 12.8,
      minZoom: 11,
      maxZoom: 18,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      // Filtrar inmuebles con coordenadas válidas
      const valid = itemsRef.current.filter((i) => i.lat != null && i.lng != null);

      map.addSource('figma-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: valid.map((i) => ({
            type: 'Feature',
            id: i.id,
            geometry: {
              type: 'Point',
              coordinates: [i.lng!, i.lat!],
            },
            properties: {
              id: i.id,
              nro: i.nro_relevamiento || i.id,
              direccion: i.direccion || i.nombre || 'Sin dirección',
              estado: i.estado_registro || 'carga',
            },
          })),
        },
      });

      // Halo blanco exterior
      map.addLayer({
        id: 'figma-points-halo',
        type: 'circle',
        source: 'figma-points',
        paint: {
          'circle-radius': 7,
          'circle-color': '#ffffff',
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#d1d5db',
        },
      });

      // Punto con color de estado (Rojo: sin tratar, Ámbar: en revisión, Verde: tratados)
      map.addLayer({
        id: 'figma-points-dot',
        type: 'circle',
        source: 'figma-points',
        paint: {
          'circle-radius': 4.5,
          'circle-color': [
            'match',
            ['get', 'estado'],
            'confirmada', '#16a34a',
            'en_revision', '#d97706',
            /* default / carga */ '#e11d48',
          ],
        },
      });

      // Cursor pointer al pasar sobre los puntos
      map.on('mouseenter', 'figma-points-dot', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'figma-points-dot', () => {
        map.getCanvas().style.cursor = '';
      });

      // Clic en punto -> selecciona caso
      map.on('click', 'figma-points-dot', (e) => {
        if (e.features && e.features[0]) {
          const id = e.features[0].properties?.id;
          if (id) {
            onSelectRef.current(Number(id));
          }
        }
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Actualizar datos de la fuente cuando items cambie
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('figma-points') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      const valid = items.filter((i) => i.lat != null && i.lng != null);
      source.setData({
        type: 'FeatureCollection',
        features: valid.map((i) => ({
          type: 'Feature',
          id: i.id,
          geometry: {
            type: 'Point',
            coordinates: [i.lng!, i.lat!],
          },
          properties: {
            id: i.id,
            nro: i.nro_relevamiento || i.id,
            direccion: i.direccion || i.nombre || 'Sin dirección',
            estado: i.estado_registro || 'carga',
          },
        })),
      });
    }
  }, [items]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
