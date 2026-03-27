import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Phone, Users, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ZoomTracker({ onZoomChange }) {
  useMapEvents({
    zoomend: (event) => {
      onZoomChange(event.target.getZoom());
    },
  });

  return null;
}

function createLabeledIcon(name, zoom) {
  const safeName = String(name || '')
    .replace(/^مركز\s+صحي\s+/i, '')
    .replace(/^مركز\s+/i, '')
    .trim();
  const fontSize = zoom >= 12 ? 14 : zoom >= 10 ? 12 : zoom >= 8 ? 11 : 10;
  const maxWidth = zoom >= 12 ? 140 : zoom >= 10 ? 120 : zoom >= 8 ? 96 : 76;

  return L.divIcon({
    className: 'health-center-label-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translateY(-6px);">
        <div style="margin-bottom: 4px; max-width: ${maxWidth}px; padding: 2px 6px; border-radius: 999px; background: rgba(255,255,255,0.92); color: #1e3a8a; font-weight: 700; font-size: ${fontSize}px; line-height: 1.2; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 1px 4px rgba(0,0,0,0.18); direction: rtl; unicode-bidi: plaintext; font-family: Cairo, Tahoma, Arial, sans-serif;">
          ${safeName}
        </div>
        <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style="width: 25px; height: 41px; display: block;" />
      </div>
    `,
    iconSize: [maxWidth, 64],
    iconAnchor: [maxWidth / 2, 64],
    popupAnchor: [0, -52],
  });
}

export default function HealthCentersMapView({ centers }) {
  const [zoomLevel, setZoomLevel] = useState(8);

  const validCenters = centers.filter((center) => {
    const lat = Number(center['خط_العرض']);
    const lng = Number(center['خط_الطول']);
    return !Number.isNaN(lat) && !Number.isNaN(lng);
  });

  const centerPosition = validCenters.length
    ? [Number(validCenters[0]['خط_العرض']), Number(validCenters[0]['خط_الطول'])]
    : [24.7136, 46.6753];

  const labeledCenters = useMemo(
    () => validCenters.map((center) => ({
      ...center,
      markerIcon: createLabeledIcon(center['اسم_المركز'], zoomLevel),
    })),
    [validCenters, zoomLevel]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-600" />
              <span>عدد المراكز على الخريطة: {validCenters.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>يمكنك الضغط على أي علامة لعرض ملخص سريع</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="h-[70vh] rounded-2xl overflow-hidden border shadow-sm">
        <MapContainer center={centerPosition} zoom={8} className="h-full w-full" scrollWheelZoom={true}>
          <ZoomTracker onZoomChange={setZoomLevel} />
          <TileLayer
            attribution='&copy; Esri & contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />

          {labeledCenters.map((center) => (
            <Marker
              key={center.id}
              position={[Number(center['خط_العرض']), Number(center['خط_الطول'])]}
              icon={center.markerIcon}
            >
              <Popup minWidth={260}>
                <div className="space-y-3 text-right" dir="rtl" style={{ unicodeBidi: 'plaintext', fontFamily: 'Cairo, Tahoma, Arial, sans-serif' }}>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">{center['اسم_المركز']}</h3>
                    <p className="text-sm text-gray-600">{center['الموقع'] || 'بدون موقع'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {center['حالة_التشغيل'] && <Badge variant="secondary">{center['حالة_التشغيل']}</Badge>}
                    {center['حالة_المركز'] && <Badge variant="outline">{center['حالة_المركز']}</Badge>}
                    {center['مركز_نائي'] ? <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">نائي</Badge> : null}
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    {center['هاتف_المركز'] && (
                      <div className="flex items-center gap-2 justify-end">
                        <span>{center['هاتف_المركز']}</span>
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    {typeof center['عدد_الموظفين_الكلي'] === 'number' && (
                      <div className="flex items-center gap-2 justify-end">
                        <span>{center['عدد_الموظفين_الكلي']} موظف</span>
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className="pt-2 text-left">
                      <Link to={`/HealthCenterMapDetails?id=${center.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                        فتح خريطة المركز التفصيلية
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}