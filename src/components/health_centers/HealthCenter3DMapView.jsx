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
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
          },
          terrainSource: {
            type: 'raster-dem',
            tiles: ['https://demotiles.maplibre.org/terrain-tiles/tiles.json'],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
          },
        ],
        terrain: {
          source: 'terrainSource',
          exaggeration: 1.35,
        },
      },
      center: [lng, lat],
      zoom: 15,
      pitch: 70,
      bearing: 25,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    map.on('load', () => {
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