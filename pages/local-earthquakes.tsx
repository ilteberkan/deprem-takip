import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { fetchEarthquakes } from '../services/earthquakeService';
import Map from '../components/Map';

export default function LocalEarthquakes() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { data: earthquakes, isLoading, isError } = useQuery('earthquakes', fetchEarthquakes);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Konum bilgisi alınamadı:', error);
          alert('Konum bilgisi alınamadı. Lütfen tarayıcınızın konum izinlerini kontrol edin.');
        }
      );
    } else {
      console.error('Tarayıcınız konum bilgisini desteklemiyor.');
      alert('Tarayıcınız konum bilgisini desteklemiyor.');
    }
  }, []);

  if (isLoading) return <div>Yükleniyor...</div>;
  if (isError) return <div>Hata oluştu</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bölgenizdeki Depremler</h1>
      {userLocation ? (
        <Map location={userLocation} earthquakes={earthquakes} />
      ) : (
        <div>Konum bilgisi alınıyor veya izin verilmedi...</div>
      )}
    </div>
  );
} 