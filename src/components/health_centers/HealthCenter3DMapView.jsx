import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function HealthCenter3DMapView({ center }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const lat = Number(center?.['خط_العرض']) || 24.7136;
    const lng = Number(center?.['خط_الطول']) || 46.6753;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [lng, lat],
      zoom: 17,
      pitch: 75,
      bearing: 25,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    map.on('load', () => {
      const layers = map.getStyle()?.layers || [];
      const labelLayerId = layers.find((layer) => layer.type === 'symbol' && layer.layout?.['text-field'])?.id;

      const buildingSourceLayer = layers.find((layer) =>
        layer.type === 'fill' && String(layer['source-layer'] || '').toLowerCase().includes('building')
      )?.['source-layer'];

      if (buildingSourceLayer) {
        map.addLayer(
          {
            id: '3d-buildings',
            source: 'openmaptiles',
            'source-layer': buildingSourceLayer,
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#94a3b8',
              'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 18],
              'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
              'fill-extrusion-opacity': 0.88,
            },
          },
          labelLayerId
        );
      }

      new maplibregl.Marker({ color: '#2563eb' })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<div dir="rtl" style="text-align:right"><strong>${center?.['اسم_المركز'] || 'المركز الصحي'}</strong></div>`))
        .addTo(map);

      map.addSource('center-circle', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [lng, lat],
              },
            },
          ],
        },
      });

      map.addLayer({
        id: 'center-glow',
        type: 'circle',
        source: 'center-circle',
        paint: {
          'circle-radius': 18,
          'circle-color': '#3b82f6',
          'circle-opacity': 0.15,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#1d4ed8',
        },
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center]);

  return <div ref={mapContainer} className="h-[75vh] w-full rounded-2xl overflow-hidden border shadow-sm" />;
}