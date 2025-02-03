import { QueryClient, QueryClientProvider } from 'react-query';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';

// QueryClient örneği oluştur
const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <title>Son Depremler - Türkiye Deprem Takip</title>
        <meta name="description" content="Türkiye'deki son depremleri anlık olarak takip edin. Kandilli Rasathanesi verileriyle güncel deprem bilgileri." />
        <meta name="keywords" content="deprem, türkiye deprem, son depremler, kandilli rasathanesi, deprem takip" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta property="og:title" content="Son Depremler - Türkiye Deprem Takip" />
        <meta property="og:description" content="Türkiye'deki son depremleri anlık olarak takip edin." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://deprem-takip.vercel.app" />
        <meta property="og:image" content="https://deprem-takip.vercel.app/og-image.png" />
        <link rel="canonical" href="https://deprem-takip.vercel.app" />
      </Head>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Analytics />
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
} 