import { useQuery } from 'react-query';
import { fetchEarthquakes } from '../services/earthquakeService';
import { getTimeAgo } from '../utils/dateUtils';
import { getMagnitudeColor } from '../utils/magnitudeUtils';
import CountryFlag from '../components/CountryFlag';
import Link from 'next/link';

export default function MajorEarthquakes() {
  const { data: earthquakes, isLoading, isError } = useQuery('earthquakes', fetchEarthquakes);

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

  const majorEarthquakes = earthquakes?.filter((earthquake) => earthquake.magnitude >= 5.0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Büyük Depremler (≥ 5.0)
      </h1>
        
      <div className="space-y-4">
        {majorEarthquakes?.map((earthquake) => (
          <Link 
            href={`/earthquake/${earthquake.id}`}
            key={earthquake.id}
            className="block transform transition-all duration-300 hover:scale-[1.01]"
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
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {earthquake.location}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-base text-gray-600 dark:text-gray-300 font-medium">
                      {new Date(earthquake.date).toLocaleString('tr-TR')}
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="text-sm text-red-500 font-medium">
                      {getTimeAgo(earthquake.date)}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-base text-gray-600">
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
          </Link>
        ))}
      </div>
    </div>
  );
}
