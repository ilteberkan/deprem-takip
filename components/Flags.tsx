import React from 'react';

export const TurkishFlag = () => (
  <svg viewBox="0 0 1200 800" className="w-full h-full">
    <rect width="1200" height="800" fill="#E30A17"/>
    <circle cx="425" cy="400" r="200" fill="#ffffff"/>
    <circle cx="475" cy="400" r="160" fill="#E30A17"/>
    <circle cx="550" cy="400" r="80" fill="#ffffff"/>
    <path
      d="M583.334 400l116.673-37.89-72.075 98.89 72.075 98.89-116.673-37.89-116.673 37.89 72.075-98.89-72.075-98.89z"
      fill="#ffffff"
    />
  </svg>
);

export const UnknownFlag = () => (
  <svg viewBox="0 0 1200 800" className="w-full h-full">
    <rect width="1200" height="800" fill="#CCCCCC"/>
    <text x="600" y="400" textAnchor="middle" fill="#666666" fontSize="100">?</text>
  </svg>
); 