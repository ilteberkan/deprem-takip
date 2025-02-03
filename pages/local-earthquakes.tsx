import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { fetchLatestEarthquakes } from '../services/earthquakeService';
import dynamic from 'next/dynamic';
import { Earthquake } from '../types';
import Clock from '../components/Clock';

// Map bileşenini client-side'da yükle
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-lg overflow-hidden bg-gray-100 animate-pulse" />
  ),
});

export default function LocalEarthquakes() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { data: earthquakes } = useQuery<Earthquake[]>('earthquakes', fetchLatestEarthquakes);

  // useEffect'i client-side'da çalıştır
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Konum alınamadı:', error);
        }
      );
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Clock />
      <h1 className="text-2xl font-bold mb-4">Bölgenizdeki Depremler</h1>
      {userLocation ? (
        <Map 
          location={userLocation} 
          earthquakes={earthquakes}
          zoom={8}
        />
      ) : (
        <div className="bg-gray-100 rounded-lg p-4 text-gray-600">
          Konum bilgisi alınıyor veya izin verilmedi...
        </div>
      )}
    </div>
  );
} 