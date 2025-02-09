import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchEarthquakeById } from '../../services/earthquakeService';
import MapComponent from '../../components/Map';
import CountryFlag from '../../components/CountryFlag';
import dynamic from 'next/dynamic';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { getTimeAgo } from '../../utils/dateUtils';
import { getMagnitudeColor } from '../../utils/magnitudeUtils';

// Leaflet'i client-side'da yükle
const MapWithNoSSR = dynamic(() => import('../../components/Map'), {
  ssr: false,
});

// Yorumları çekmek için fonksiyon
const fetchComments = async (earthquakeId: string) => {
  const res = await fetch(`/api/comments/${earthquakeId}`);
  if (!res.ok) throw new Error('Yorumlar yüklenemedi');
  return res.json();
};

// Yorum göndermek için fonksiyon
const postComment = async ({ earthquakeId, content }: { earthquakeId: string; content: string }) => {
  const res = await fetch(`/api/comments/${earthquakeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Yorum gönderilemedi');
  return res.json();
};

// Profil resmi için özel bir bileşen oluşturalım
const ProfileImage = ({ src, alt, size = 40 }: { src?: string | null, alt: string, size?: number }) => {
  const defaultImage = '/default-avatar.png';
  
  return (
    <div 
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={src || defaultImage}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onError={(e) => {
          // Resim yüklenemezse varsayılan resmi göster
          (e.target as HTMLImageElement).src = defaultImage;
        }}
      />
    </div>
  );
};

// Koordinat formatlama fonksiyonu
const formatCoordinates = (coords: [number, number]) => {
  return `${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E`;
};

export default function EarthquakeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [comment, setComment] = useState('');

  const { data: earthquake, isLoading, isError, error } = useQuery(
    ['earthquake', id],
    () => fetchEarthquakeById(id as string),
    {
      enabled: !!id,
      retry: 1,
      onError: (error) => {
        console.error('Deprem detayı yüklenirken hata:', error);
      }
    }
  );

  const queryClient = useQueryClient();
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery(
    ['comments', id],
    () => fetchComments(id as string),
    { enabled: !!id }
  );

  const mutation = useMutation(postComment, {
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', id]);
      setComment('');
      toast.success('Yorumunuz başarıyla eklendi');
    },
    onError: (error: any) => {
      if (error.response?.data?.isAuthError) {
        signIn('google');
      } else {
        toast.error('Yorum eklenirken bir hata oluştu');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isError || !earthquake) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-2">
          Deprem bulunamadı veya bir hata oluştu
        </h2>
        <p className="text-red-600 mb-4">
          {error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfa</span>
          </Link>
        </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 mb-8">
          <div className="w-32 flex-shrink-0">
            <div className="rounded-xl overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center p-4">
                <CountryFlag countryCode="TR" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {earthquake.location}
            </h1>
            <div className="text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{formatCoordinates(earthquake.coordinates)}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tarih</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  {new Date(earthquake.date).toLocaleString('tr-TR')}
                </div>
                <div className="text-sm text-red-500 mt-1 font-medium">
                  {getTimeAgo(earthquake.date)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Büyüklük</div>
                <div className={`text-lg text-magnitude ${getMagnitudeColor(earthquake.magnitude)}`}>
                  {earthquake.magnitude.toFixed(1)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Derinlik</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  {earthquake.depth} km
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Koordinatlar</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  {formatCoordinates(earthquake.coordinates)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Harita */}
        <div className="rounded-xl overflow-hidden shadow-inner">
          <MapWithNoSSR
            location={earthquake.coordinates}
            title={earthquake.location}
          />
        </div>
      </div>

      {/* Yorumlar Bölümü */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Yorumlar</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {comments.length} yorum
          </div>
        </div>
        
        {session ? (
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <ProfileImage
                src={session.user?.image}
                alt={session.user?.name || 'Kullanıcı'}
              />
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Düşüncelerinizi paylaşın..."
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    onClick={() => mutation.mutate({ earthquakeId: id as string, content: comment })}
                    disabled={!comment.trim() || mutation.isLoading}
                  >
                    {mutation.isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                        Yorum Yap
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Yorum yapmak için giriş yapın</p>
              <button
                onClick={() => signIn('google')}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
              >
                <Image
                  src="/google-icon.png"
                  alt="Google"
                  width={20}
                  height={20}
                  unoptimized
                />
                <span className="font-medium">Google ile Giriş Yap</span>
              </button>
            </div>
          </div>
        )}

        {/* Yorumlar Listesi */}
        <div className="space-y-6">
          {isCommentsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment: any) => (
              <div key={comment._id} className="group">
                <div className="flex items-start gap-4">
                  <ProfileImage
                    src={comment.userImage}
                    alt={comment.userName}
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900 dark:text-white">{comment.userName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-2">Henüz yorum yapılmamış</div>
              <div className="text-sm text-gray-400 dark:text-gray-500">İlk yorumu siz yapın!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
