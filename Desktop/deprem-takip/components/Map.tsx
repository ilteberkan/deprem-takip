import { LatLngExpression } from 'leaflet';
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

// Dynamically import all Leaflet components
const Map = dynamic(
  () => import('react-leaflet').then((mod) => {
    // These need to be required here
    require('leaflet/dist/leaflet.css');
    require('leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css');
    require('leaflet-defaulticon-compatibility');
    return mod.MapContainer;
  }),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-lg overflow-hidden bg-gray-100 animate-pulse" />
    ),
  }
);

const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false
});

const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false
});

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false
});

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
      <Map 
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
              <div className="p-2">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Deprem Bölgesi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{location[0].toFixed(4)}°N, {location[1].toFixed(4)}°E</span>
                  </div>
                </div>
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
      </Map>
    </div>
  );
};

export default MapComponent;
