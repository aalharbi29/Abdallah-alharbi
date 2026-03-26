import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';

const blueIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const governmentIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: '<div style="background:#10b981;border:3px solid white;width:18px;height:18px;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.25)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const commercialIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: '<div style="background:#f59e0b;border:3px solid white;width:18px;height:18px;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.25)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const otherIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: '<div style="background:#64748b;border:3px solid white;width:18px;height:18px;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.25)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const redIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: '<div style="background:#ef4444;border:3px solid white;width:18px;height:18px;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.25)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });

  return null;
}

export default function HealthCenterDetailMapView({ center, importantPoints, epidemicCases, onMapClick }) {
  const lat = Number(center['خط_العرض']);
  const lng = Number(center['خط_الطول']);
  const position = !Number.isNaN(lat) && !Number.isNaN(lng) ? [lat, lng] : [24.7136, 46.6753];

  return (
    <div className="h-[70vh] rounded-2xl overflow-hidden border shadow-sm">
      <MapContainer center={position} zoom={13} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={onMapClick} />

        {!Number.isNaN(lat) && !Number.isNaN(lng) && (
          <Marker position={position} icon={blueIcon}>
            <Popup>
              <div dir="rtl" className="text-right space-y-2">
                <div className="font-bold">{center['اسم_المركز']}</div>
                <div className="text-sm text-gray-600">{center['الموقع'] || 'بدون وصف موقع'}</div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">المركز الصحي</Badge>
              </div>
            </Popup>
          </Marker>
        )}

        {importantPoints.map((point) => {
          const isGovernment = point.category === 'government';
          const isCommercial = point.category === 'shop';
          const pointIcon = isGovernment ? governmentIcon : isCommercial ? commercialIcon : otherIcon;
          const badgeClass = isGovernment
            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
            : isCommercial
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-100';
          const label = isGovernment ? 'جهة حكومية' : isCommercial ? 'منشأة تجارية' : 'نقطة أخرى';

          return (
            <Marker key={point.id} position={[point.latitude, point.longitude]} icon={pointIcon}>
              <Popup>
                <div dir="rtl" className="text-right space-y-2">
                  <div className="font-bold">{point.title}</div>
                  <Badge className={badgeClass}>{label}</Badge>
                  {point.description ? <div className="text-sm text-gray-600">{point.description}</div> : null}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {epidemicCases.map((item) => (
          <Marker key={item.id} position={[item.latitude, item.longitude]} icon={redIcon}>
            <Popup>
              <div dir="rtl" className="text-right space-y-2">
                <div className="font-bold">{item.case_title}</div>
                <div className="text-sm">{item.disease_name}</div>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{item.status}</Badge>
                {item.report_date ? <div className="text-xs text-gray-500">{item.report_date}</div> : null}
                {item.notes ? <div className="text-sm text-gray-600">{item.notes}</div> : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}