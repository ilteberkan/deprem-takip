import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#EF4444" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* PWA için manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple cihazlar için ikonlar */}
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        <link rel="apple-touch-startup-image" href="/splash.png" />
        
        {/* Safari için özel stil */}
        <link rel="stylesheet" href="/css/safari.css" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 