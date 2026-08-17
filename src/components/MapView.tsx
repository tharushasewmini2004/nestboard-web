import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Property } from '@/types';
import { useFormatPrice } from '@/context/CurrencyContext';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

interface MapViewProps {
  properties: Property[];
  center: [number, number];
  zoom?: number;
  height?: string;
}

export function MapView({ properties, center, zoom = 5, height = '500px' }: MapViewProps) {
  const formatPrice = useFormatPrice();
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800" style={{ height }}>
      <MapContainer
        key={`${center[0]}-${center[1]}-${zoom}`}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <MapRecenter center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={icon}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">{p.city}</p>
                <p className="mt-1 text-sm font-medium text-nest-700">
                  From {formatPrice(p.startingPrice).primary}/mo
                </p>
                <Link
                  to={`/properties/${p.id}`}
                  className="mt-2 inline-block text-sm font-semibold text-nest-600 hover:underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
