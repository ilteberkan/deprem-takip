import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Earthquake } from '../types';
import { getMagnitudeColor } from '../utils/magnitudeUtils';
import { getTimeAgo } from '../utils/dateUtils';

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
              <div className="p-2">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{earthquake.location}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${getMagnitudeColor(earthquake.magnitude)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className={`text-magnitude ${getMagnitudeColor(earthquake.magnitude)}`}>
                      Büyüklük: {earthquake.magnitude.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span>Derinlik: {earthquake.depth} km</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="text-sm text-gray-600">
                      {new Date(earthquake.date).toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm font-medium text-red-500">
                      {getTimeAgo(earthquake.date)}
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapWithNoSSR>
    </div>
  );
};

export default MapComponent;
