// Ülke tespiti için yardımcı fonksiyon
export function detectCountry(location: string): string {
  const locationUpper = location.toUpperCase();
  
  // Türkiye için kontrol
  if (locationUpper.includes('EGE') || 
      locationUpper.includes('MARMARA') || 
      locationUpper.includes('AKDENIZ') || 
      locationUpper.includes('KARADENIZ') ||
      locationUpper.includes('ANADOLU') ||
      locationUpper.includes('TURKEY') ||
      locationUpper.includes('TURKIYE')) {
    return 'TR';
  }
  
  // Amerika için kontrol
  if (locationUpper.includes('USA') || 
      locationUpper.includes('UNITED STATES') || 
      locationUpper.includes('CALIFORNIA') || 
      locationUpper.includes('ALASKA')) {
    return 'US';
  }
  
  // Diğer ülkeler için kontroller eklenebilir...
  
  return 'UNKNOWN'; // Bilinmeyen lokasyonlar için
}

// Ülke bayrakları için SVG komponentleri
export const Flags = {
  TR: () => (
    <svg viewBox="0 0 1200 800" className="w-full h-full">
      <rect width="1200" height="800" fill="#E30A17"/>
      <circle cx="425" cy="400" r="200" fill="#ffffff"/>
      <circle cx="475" cy="400" r="160" fill="#E30A17"/>
      <polygon points="583.334,400 764.235,458.779 652.431,304.894 652.431,495.106 764.235,341.221" fill="#ffffff"/>
    </svg>
  ),
  US: () => (
    <svg viewBox="0 0 1200 800" className="w-full h-full">
      <rect width="1200" height="800" fill="#FFFFFF"/>
      <g fill="#D02F44">
        <rect width="1200" height="61.5" y="0"/>
        <rect width="1200" height="61.5" y="123"/>
        <rect width="1200" height="61.5" y="246"/>
        <rect width="1200" height="61.5" y="369"/>
        <rect width="1200" height="61.5" y="492"/>
        <rect width="1200" height="61.5" y="615"/>
        <rect width="1200" height="61.5" y="738.5"/>
      </g>
      <rect width="500" height="431" fill="#46467F"/>
    </svg>
  ),
  UNKNOWN: () => (
    <svg viewBox="0 0 1200 800" className="w-full h-full">
      <rect width="1200" height="800" fill="#CCCCCC"/>
      <text x="600" y="400" textAnchor="middle" fill="#666666" fontSize="100">?</text>
    </svg>
  )
}; 