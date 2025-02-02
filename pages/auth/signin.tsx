import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SignIn() {
  const router = useRouter();
  const { callbackUrl, error } = router.query;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Giriş Yap</h2>
          <p className="mt-2 text-gray-600">Son Depremler uygulamasına hoş geldiniz</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.
          </div>
        )}

        <button
          onClick={() => signIn('google', { callbackUrl: callbackUrl as string || '/' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <img src="/google-icon.png" alt="Google" className="w-6 h-6" />
          <span className="text-gray-700 font-medium">Google ile Devam Et</span>
        </button>
      </div>
    </div>
  );
} 