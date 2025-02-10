import { Earthquake } from '../types';

// Örnek statik veri
const MOCK_EARTHQUAKES: Earthquake[] = [
  {
    id: '1',
    location: 'EGE DENIZI',
    date: '2025-02-03T00:19:55',
    magnitude: 2.9,
    coordinates: [38.84, 26.32],
    depth: 8.16
  },
  {
    id: '2',
    location: 'MARMARA DENIZI',
    date: '2025-02-03T00:15:30',
    magnitude: 3.2,
    coordinates: [40.84, 28.32],
    depth: 7.5
  },
  {
    id: '3',
    location: 'AKDENIZ',
    date: '2025-02-03T00:10:15',
    magnitude: 2.7,
    coordinates: [36.84, 30.32],
    depth: 5.8
  }
];

export const fetchEarthquakes = async (): Promise<Earthquake[]> => {
  try {
    const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Deprem verileri alınamadı');
    }

    const data = await response.json();

    if (!data.result || !Array.isArray(data.result)) {
      throw new Error('Geçersiz veri formatı');
    }

    return data.result.map((item: any) => ({
      id: item._id || String(new Date().getTime()),
      location: item.title || 'Konum bilgisi yok',
      date: item.date || new Date().toISOString(),
      magnitude: parseFloat(item.mag) || 0,
      depth: parseFloat(item.depth) || 0,
      coordinates: [
        parseFloat(item.geojson.coordinates[1]) || 39.9334,
        parseFloat(item.geojson.coordinates[0]) || 32.8597
      ] as [number, number]
    }));

  } catch (error) {
    console.error('Deprem verileri çekilirken hata:', error);
    // Hata durumunda boş dizi döndür
    return [];
  }
};

const API_BASE_URL = 'https://api.orhanaydogdu.com.tr/deprem/kandilli';

interface ApiEarthquake {
  _id: string;
  title: string;
  date: string;
  mag: string;
  depth: string;
  geojson: {
    coordinates: [number, number];
  };
}

export const fetchLatestEarthquakes = async (): Promise<Earthquake[]> => {
  try {
    const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live?limit=100');
    
    if (!response.ok) {
      throw new Error('Deprem verileri alınamadı');
    }

    const data = await response.json();

    if (!data.result || !Array.isArray(data.result)) {
      throw new Error('Geçersiz veri formatı');
    }

    return data.result
      .filter((item: ApiEarthquake) => item.geojson?.coordinates)
      .map((item: ApiEarthquake): Earthquake => ({
        id: item._id || String(new Date().getTime()),
        location: item.title || 'Konum bilgisi yok',
        date: item.date || new Date().toISOString(),
        magnitude: parseFloat(item.mag) || 0,
        depth: parseFloat(item.depth) || 0,
        coordinates: [
          parseFloat(String(item.geojson.coordinates[1])) || 39.9334,
          parseFloat(String(item.geojson.coordinates[0])) || 32.8597
        ] as [number, number]
      }))
      .sort((a: Earthquake, b: Earthquake) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

  } catch (error) {
    console.error('Deprem verileri çekilirken hata:', error);
    return [];
  }
};

export const fetchEarthquakeById = async (id: string): Promise<Earthquake | null> => {
  try {
    const earthquakes = await fetchLatestEarthquakes();
    const earthquake = earthquakes.find(eq => eq.id === id);
    
    if (!earthquake) {
      throw new Error('Deprem bulunamadı');
    }

    return earthquake;
  } catch (error) {
    console.error('Deprem detayı alınırken hata:', error);
    return null;
  }
};

export const fetchLast24HoursEarthquakes = async (): Promise<Earthquake[]> => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    const response = await fetch(`${API_BASE_URL}/live?limit=1000`);
    if (!response.ok) {
      throw new Error('Deprem verileri alınamadı');
    }
    const data = await response.json();

    if (!data.result || !Array.isArray(data.result)) {
      throw new Error('Geçersiz veri formatı');
    }

    return data.result
      .filter((item: ApiEarthquake) => new Date(item.date) >= yesterday)
      .map((item: ApiEarthquake): Earthquake => ({
        id: item._id || String(new Date().getTime()),
        location: item.title || 'Konum bilgisi yok',
        date: item.date || new Date().toISOString(),
        magnitude: parseFloat(item.mag) || 0,
        depth: parseFloat(item.depth) || 0,
        coordinates: [
          parseFloat(String(item.geojson.coordinates[1])) || 39.9334,
          parseFloat(String(item.geojson.coordinates[0])) || 32.8597
        ] as [number, number]
      }))
      .sort((a: Earthquake, b: Earthquake) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  } catch (error) {
    console.error('Son 24 saatteki depremler çekilirken hata:', error);
    return [];
  }
};

export const fetchMajorEarthquakes = async (): Promise<Earthquake[]> => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const response = await fetch(`${API_BASE_URL}/live?limit=1000`);
    if (!response.ok) {
      throw new Error('Deprem verileri alınamadı');
    }
    const data = await response.json();

    if (!data.result || !Array.isArray(data.result)) {
      throw new Error('Geçersiz veri formatı');
    }

    return data.result
      .filter((item: ApiEarthquake) => parseFloat(item.mag) >= 5 && new Date(item.date) >= yesterday)
      .map((item: ApiEarthquake): Earthquake => ({
        id: item._id || String(new Date().getTime()),
        location: item.title || 'Konum bilgisi yok',
        date: item.date || new Date().toISOString(),
        magnitude: parseFloat(item.mag) || 0,
        depth: parseFloat(item.depth) || 0,
        coordinates: [
          parseFloat(String(item.geojson.coordinates[1])) || 39.9334,
          parseFloat(String(item.geojson.coordinates[0])) || 32.8597
        ] as [number, number]
      }))
      .sort((a: Earthquake, b: Earthquake) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  } catch (error) {
    console.error('Büyük depremler çekilirken hata:', error);
    return [];
  }
};
