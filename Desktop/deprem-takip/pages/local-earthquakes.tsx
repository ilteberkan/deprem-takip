import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import { fetchLatestEarthquakes } from '../services/earthquakeService';
import MapComponent from '../components/Map';
import { toast } from 'react-hot-toast';
import { Earthquake } from '../types';

export default function LocalEarthquakes() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { data: allEarthquakes, isLoading, isError } = useQuery('earthquakes', fetchLatestEarthquakes);

  const requestLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsLocating(false);
          toast.success('Konum başarıyla alındı');
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          toast.error('Konum alınamadı. Lütfen konum izni verin.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error('Tarayıcınız konum hizmetini desteklemiyor.');
      setIsLocating(false);
    }
  };

  // Kullanıcının konumuna yakın depremleri filtrele (200km yarıçap içinde)
  const localEarthquakes = userLocation && allEarthquakes
    ? allEarthquakes.filter((eq: Earthquake) => {
        const distance = getDistanceFromLatLonInKm(
          userLocation[0],
          userLocation[1],
          eq.coordinates[0],
          eq.coordinates[1]
        );
        return distance <= 200; // 200km yarıçap
      })
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-600">Veriler yüklenirken bir hata oluştu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfa</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bölgenizdeki Depremler
          </h1>
        </div>
        <button
          onClick={requestLocation}
          disabled={isLocating}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLocating ? (
            <span className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Konum Alınıyor...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Konumumu Bul</span>
            </span>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <MapComponent
          location={userLocation || [39.9334, 32.8597]} // Default to Turkey's center if no location
          earthquakes={userLocation ? localEarthquakes : allEarthquakes}
          zoom={userLocation ? 8 : 4} // Wider view for worldwide earthquakes
        />
        {userLocation && localEarthquakes.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Bölgenizde son 24 saat içinde kaydedilen deprem bulunmuyor.
          </div>
        )}
        {!userLocation && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Bölgenizdeki depremleri görmek için konumunuzu paylaşabilirsiniz.
          </div>
        )}
      </div>
    </div>
  );
}

// İki nokta arası mesafe hesaplama (Haversine formülü)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
