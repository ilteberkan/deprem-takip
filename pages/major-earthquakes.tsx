import { useQuery } from 'react-query';
import { fetchEarthquakes } from '../services/earthquakeService';

export default function MajorEarthquakes() {
  const { data: earthquakes, isLoading, isError } = useQuery('earthquakes', fetchEarthquakes);

  if (isLoading) return <div>Yükleniyor...</div>;
  if (isError) return <div>Hata oluştu</div>;

  const majorEarthquakes = earthquakes?.filter((earthquake) => earthquake.magnitude >= 5.0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Büyük Depremler</h1>
      <div className="space-y-4">
        {majorEarthquakes?.map((earthquake) => (
          <div key={earthquake.id} className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">{earthquake.location}</h2>
            <p className="text-gray-600">{earthquake.date}</p>
            <p className="text-gray-600">Büyüklük: {earthquake.magnitude}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 