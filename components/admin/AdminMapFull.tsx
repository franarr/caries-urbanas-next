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
  const { selectedId } = useAdminStore();

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
      map.addSource('full-relevamientos', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'full-points',
        type: 'circle',
        source: 'full-relevamientos',
        paint: {
          'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 9, 6],
          'circle-color': [
            'match',
            ['get', 'estado_registro'],
            'en_revision', '#e8ab42',
            'confirmada', '#4fd88a',
            'eliminada', '#777777',
            '#f0564a',
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#09090b',
        },
      });

      map.on('click', 'full-points', (e) => {
        if (e.features && e.features[0]) {
          const id = e.features[0].properties?.id;
          const found = items.find((i) => i.id === id);
          if (found) onSelectLote(found);
        }
      });

      map.on('mouseenter', 'full-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'full-points', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [items, onSelectLote]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const valid = items.filter((i) => i.lat != null && i.lng != null);
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

    const update = () => {
      const src = map.getSource('full-relevamientos') as maplibregl.GeoJSONSource;
      if (src) src.setData(data);
    };

    if (map.isStyleLoaded()) update();
    else map.once('load', update);
  }, [items]);

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

  return (
    <div className="full-map-container">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
