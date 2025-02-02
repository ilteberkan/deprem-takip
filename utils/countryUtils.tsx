import React from 'react';

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
  
  return 'TR'; // Şimdilik hepsi Türkiye
}

// Ülke bayrakları için SVG komponentleri
export const Flags: Record<string, React.FC> = {
  TR: () => (
    <div className="w-full h-full relative">
      <svg 
        viewBox="0 0 30 20"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width="30" height="20" fill="#E30A17"/>
        <circle cx="13" cy="10" r="5" fill="#ffffff"/>
        <circle cx="14.5" cy="10" r="4" fill="#E30A17"/>
        <path
          d="M16.5 10l4 1.5l-2.5,-3.5l0,4l2.5,-3.5z"
          fill="#ffffff"
        />
      </svg>
    </div>
  ),
  US: () => (
    <div className="w-full h-full relative">
      {/* Amerika bayrağı SVG'si buraya eklenebilir */}
    </div>
  ),
  UNKNOWN: () => (
    <div className="w-full h-full relative">
      <svg 
        viewBox="0 0 30 20"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width="30" height="20" fill="#CCCCCC"/>
        <text x="15" y="10" textAnchor="middle" fill="#666666" fontSize="10">?</text>
      </svg>
    </div>
  )
}; 