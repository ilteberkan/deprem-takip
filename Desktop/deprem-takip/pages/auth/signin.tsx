import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const SignIn = () => {
  const router = useRouter();

  const handleSignIn = async () => {
    const result = await signIn('google', { callbackUrl: '/' }); // Giriş yaptıktan sonra anasayfaya yönlendir
    if (result?.error) {
      console.error('Giriş hatası:', result.error);
    }
  };

  return (
    <button onClick={handleSignIn}>
      Google ile Giriş Yap
    </button>
  );
};

export default SignIn; 