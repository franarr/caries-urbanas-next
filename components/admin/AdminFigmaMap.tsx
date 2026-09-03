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

      // Popup emergente al hacer hover
      const hoverPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 8,
        className: 'figma-hover-popup',
      });

      // Cursor pointer y tooltip al pasar sobre los puntos (hover)
      map.on('mouseenter', 'figma-points-dot', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0]) {
          const feat = e.features[0];
          const props = feat.properties;
          const coords = (feat.geometry as any).coordinates.slice();

          const caseNum = `#${String(props?.nro || props?.id).padStart(4, '0')}`;
          const address = props?.direccion || 'Sin dirección';

          const html = `
            <div class="hover-tooltip">
              <div class="hover-top">
                <span class="hover-id">Caso ${caseNum}</span>
                <span class="hover-action">Ver archivo ›</span>
              </div>
              <div class="hover-address">${address}</div>
            </div>
          `;

          hoverPopup.setLngLat(coords).setHTML(html).addTo(map);
        }
      });

      // Popup interactivo al hacer clic
      let activeClickPopup: maplibregl.Popup | null = null;

      // Clic en punto -> centrado suave y apertura de ficha previa
      map.on('click', 'figma-points-dot', (e) => {
        if (e.features && e.features[0]) {
          const feat = e.features[0];
          const props = feat.properties;
          const coords = (feat.geometry as any).coordinates.slice();
          const id = Number(props?.id);

          hoverPopup.remove();
          if (activeClickPopup) activeClickPopup.remove();

          // Centrado suave mostrando el movimiento hacia el lote
          map.easeTo({
            center: coords,
            zoom: Math.max(map.getZoom(), 15.2),
            offset: window.innerWidth <= 768 ? [0, -100] : [0, 0],
            duration: 400,
          });

          const caseNum = `#${String(props?.nro || id).padStart(4, '0')}`;
          const address = props?.direccion || 'Sin dirección registrada';
          const estado = props?.estado || 'carga';
          const estadoLabel = estado === 'confirmada' ? 'Tratado' : estado === 'en_revision' ? 'En revisión' : 'Sin tratar';
          const dotColor = estado === 'confirmada' ? '#16a34a' : estado === 'en_revision' ? '#d97706' : '#e11d48';

          const container = document.createElement('div');
          container.className = 'map-click-card';
          container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-family: var(--font-heading); font-size: 13px; font-weight: 800; color: #111827;">Caso ${caseNum}</span>
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 600; color: ${dotColor};">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: ${dotColor};"></span>
                ${estadoLabel}
              </span>
            </div>
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 10px; line-height: 1.3;">
              ${address}
            </div>
            <button id="btn-open-detail-${id}" class="btn-black" style="width: 100%; height: 32px; font-size: 11.5px;">
              Ver archivo completo →
            </button>
          `;

          const btn = container.querySelector(`#btn-open-detail-${id}`);
          btn?.addEventListener('click', () => {
            activeClickPopup?.remove();
            onSelectRef.current(id);
          });

          activeClickPopup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: '260px',
            offset: 12,
            className: 'figma-click-popup',
          })
            .setLngLat(coords)
            .setDOMContent(container)
            .addTo(map);
        }
      });
    });

    // Forzar resize para mobile
    const timer = setTimeout(() => {
      map.resize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Actualizar datos de la fuente cuando items cambie
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateSource = () => {
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
    };

    if (map.isStyleLoaded()) {
      updateSource();
    } else {
      map.once('load', updateSource);
    }
  }, [items]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
