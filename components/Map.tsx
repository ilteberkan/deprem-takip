import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Earthquake } from '../types';

interface MapProps {
  location: [number, number];
  title?: string;
  earthquakes?: Earthquake[];
  zoom?: number;
}

// MapContainer'ı client-side'da yükle
const MapWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-lg overflow-hidden bg-gray-100 animate-pulse" />
    ),
  }
);

const MapComponent: React.FC<MapProps> = ({ 
  location, 
  title, 
  earthquakes = [], 
  zoom = 13 
}) => {
  const validLocation: LatLngExpression = [
    isNaN(location[0]) ? 39.9334 : location[0],
    isNaN(location[1]) ? 32.8597 : location[1]
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      require('leaflet');
      require('leaflet-defaulticon-compatibility');
    }
  }, []);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <MapWithNoSSR 
        center={validLocation}
        zoom={zoom} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {title ? (
          <Marker position={validLocation}>
            <Popup>
              <div>
                <h3 className="font-semibold">Deprem Bölgesi</h3>
                <p>{title}</p>
              </div>
            </Popup>
          </Marker>
        ) : null}
        
        {earthquakes.map((earthquake) => (
          <Marker 
            key={earthquake.id}
            position={earthquake.coordinates as LatLngExpression}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{earthquake.location}</h3>
                <p>Büyüklük: {earthquake.magnitude}</p>
                <p>Derinlik: {earthquake.depth} km</p>
                <p>Tarih: {new Date(earthquake.date).toLocaleString('tr-TR')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapWithNoSSR>
    </div>
  );
};

export default MapComponent; 