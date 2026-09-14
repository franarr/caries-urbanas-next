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

/** Devuelve el color de pastilla segun tipo */
function tipoColor(tipo?: string): string {
  if (tipo === 'vacancia') return '#6b7280';
  if (tipo === 'patrimonio') return '#d97706';
  return '#B5451B'; // terracota para caries (default)
}

/** Devuelve la etiqueta legible segun tipo / patrimonio */
function estadoLabel(tipo?: string, patrimonio?: boolean): string {
  if (tipo === 'vacancia') return 'Vacancia';
  if (patrimonio) return 'Patrimonio';
  return 'Carie urbana';
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
              direccion: i.direccion || i.nombre || 'Sin direccion',
              distrito: i.distrito || 'CENTRO',
              tipo: i.tipo || 'carie',
              patrimonio: Boolean(i.patrimonio),
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

      // Puntos de color segun tipo
      map.addLayer({
        id: 'figma-points-dot',
        type: 'circle',
        source: 'figma-points',
        paint: {
          'circle-radius': 4.5,
          'circle-color': [
            'case',
            ['get', 'patrimonio'], '#d97706',
            ['==', ['get', 'tipo'], 'vacancia'], '#6b7280',
            '#111827',
          ],
        },
      });

      // ─── Hover popup ─────────────────────────────────────────────────────────
      const hoverPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 8,
        className: 'figma-hover-popup',
      });

      map.on('mouseenter', 'figma-points-dot', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0]) {
          const feat = e.features[0];
          const props = feat.properties;
          const coords = (feat.geometry as any).coordinates.slice();

          const caseNum = `#${String(props?.nro || props?.id).padStart(4, '0')}`;
          const address = props?.direccion || 'Sin direccion';
          const tipo = props?.tipo;
          const pillColor = tipoColor(tipo);
          const label = tipo === 'vacancia' ? 'Vacancia' : tipo === 'patrimonio' ? 'Patrimonio' : 'Carie';

          const html = `
            <div class="hover-tooltip">
              <div class="hover-top">
                <span class="hover-id">Caso ${caseNum}</span>
                <span class="hover-action">Ver archivo &rsaquo;</span>
              </div>
              <div class="hover-address">${address}</div>
              <div style="margin-top:5px;">
                <span style="background:${pillColor};color:#fff;border-radius:100px;padding:2px 7px;font-size:10px;font-weight:600;display:inline-block;line-height:1.5;">${label}</span>
              </div>
            </div>
          `;

          hoverPopup.setLngLat(coords).setHTML(html).addTo(map);
        }
      });

      map.on('mouseleave', 'figma-points-dot', () => {
        map.getCanvas().style.cursor = '';
        hoverPopup.remove();
      });

      // ─── Click popup ─────────────────────────────────────────────────────────
      let activeClickPopup: maplibregl.Popup | null = null;

      map.on('click', 'figma-points-dot', (e) => {
        if (e.features && e.features[0]) {
          const feat = e.features[0];
          const props = feat.properties;
          const coords = (feat.geometry as any).coordinates.slice();
          const id = Number(props?.id);

          hoverPopup.remove();
          if (activeClickPopup) activeClickPopup.remove();

          map.easeTo({
            center: coords,
            zoom: Math.max(map.getZoom(), 15.2),
            offset: window.innerWidth <= 768 ? [0, -100] : [0, 0],
            duration: 400,
          });

          const caseNum = `#${String(props?.nro || id).padStart(4, '0')}`;
          const address = props?.direccion || 'Sin direccion registrada';
          const distrito = props?.distrito || '';
          const tipo: string = props?.tipo || 'carie';
          const patrimonio: boolean = props?.patrimonio === true || props?.patrimonio === 'true';

          const headerColor = tipoColor(tipo);
          const label = estadoLabel(tipo, patrimonio);
          const pillColor = tipoColor(tipo);

          const container = document.createElement('div');
          container.className = 'map-click-card';
          container.innerHTML = `
            <div style="background:${headerColor};padding:10px 14px;border-radius:8px 8px 0 0;">
              <span style="font-family:var(--font-heading);font-size:14px;font-weight:800;color:#fff;">Caso ${caseNum}</span>
            </div>
            <div style="padding:10px 14px;background:#fff;border-radius:0 0 8px 8px;">
              <div style="font-size:12px;color:#4b5563;line-height:1.3;margin-bottom:4px;">${address}</div>
              ${distrito ? `<div style="font-size:11px;color:#9ca3af;margin-bottom:6px;">${distrito}</div>` : ''}
              <span style="background:${pillColor};color:#fff;border-radius:100px;padding:2px 7px;font-size:10px;font-weight:600;display:inline-block;line-height:1.5;margin-bottom:2px;">${label}</span>
              <button id="btn-open-detail-${id}" class="btn-black" style="margin-top:10px;width:100%;height:32px;font-size:11.5px;">
                Ver archivo completo &rarr;
              </button>
            </div>
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

    const timer = setTimeout(() => { map.resize(); }, 250);

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
              direccion: i.direccion || i.nombre || 'Sin direccion',
              distrito: i.distrito || 'CENTRO',
              tipo: i.tipo || 'carie',
              patrimonio: Boolean(i.patrimonio),
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
