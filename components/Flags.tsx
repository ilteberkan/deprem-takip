import React from 'react';

export const TurkishFlag = () => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/240px-Flag_of_Turkey.svg.png" 
    alt="Türk Bayrağı" 
    className="w-full h-full" 
  />
);

export const UnknownFlag = () => (
  <svg viewBox="0 0 1200 800" className="w-full h-full">
    <rect width="1200" height="800" fill="#CCCCCC"/>
    <text x="600" y="400" textAnchor="middle" fill="#666666" fontSize="100">?</text>
  </svg>
); 