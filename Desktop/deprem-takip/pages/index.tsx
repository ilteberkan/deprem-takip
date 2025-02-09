import { useQuery } from 'react-query';
import { Earthquake } from '../types';
import { fetchLatestEarthquakes } from '../services/earthquakeService';
import Link from 'next/link';
import CountryFlag from '../components/CountryFlag';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { getTimeAgo } from '../utils/dateUtils';
import { getMagnitudeColor } from '../utils/magnitudeUtils';

// Koordinat formatlama fonksiyonu
const formatCoordinates = (coords: [number, number]) => {
  return `${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E`;
};

const Home = () => {
  const router = useRouter();
  const { data: earthquakes, isLoading, isError, refetch } = useQuery<Earthquake[]>(
    'earthquakes', 
    fetchLatestEarthquakes,
    {
      refetchInterval: 60000, // Her dakika güncelle
      refetchIntervalInBackground: true,
      retry: 3,
      onError: (error) => {
        console.error('Depremler yüklenirken hata:', error);
        toast.error('Depremler yüklenirken bir hata oluştu');
      }
    }
  );

  const { data: session } = useSession();

  const handleRefresh = async () => {
    try {
      // Yenileme butonunu devre dışı bırak ve loading durumuna geç
      const button = document.getElementById('refresh-button') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.classList.add('opacity-75');
      }

      // Önce React Query cache'ini yenile
      await refetch();
      
      // Sonra sayfayı yenile
      router.reload();
    } catch (error) {
      console.error('Yenileme hatası:', error);
      // Hata durumunda butonu tekrar aktif et
      const button = document.getElementById('refresh-button') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.classList.remove('opacity-75');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
        <p className="text-red-600 dark:text-red-400">Veriler yüklenirken bir hata oluştu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Son Depremler
          </h1>
          <button
            id="refresh-button"
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Yenile
          </button>
        </div>

        {/* Deprem Kartları */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-1">
          {earthquakes?.map((earthquake) => (
            <Link 
              href={`/earthquake/${earthquake.id}`} 
              key={earthquake.id}
              className="block transform transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex">
                  {/* Sol Kısım - Bayrak ve Büyüklük */}
                  <div className="w-24 sm:w-32 flex-shrink-0 flex flex-col">
                    <div className="h-20 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center p-3">
                      <CountryFlag countryCode="TR" />
                    </div>
                    <div className="h-16 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-2xl text-magnitude ${getMagnitudeColor(earthquake.magnitude)}`}>
                          {earthquake.magnitude.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Büyüklük</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sağ Kısım - Bilgiler */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                          {earthquake.location}
                        </h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{formatCoordinates(earthquake.coordinates)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="text-base text-gray-600 dark:text-gray-300 font-medium">
                            {new Date(earthquake.date).toLocaleString('tr-TR')}
                          </div>
                          <span className="text-gray-400">•</span>
                          <div className="text-sm text-red-500 font-medium">
                            {getTimeAgo(earthquake.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-base text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          <span className="font-medium">{earthquake.depth} km</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span>Detayları Görüntüle</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
    </div>
  );
};

export default Home;
