import React from 'react';

interface CountryFlagProps {
  countryCode: string;
}

const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode }) => {
  return (
    <img
      src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w160/${countryCode.toLowerCase()}.png 2x`}
      width="80"
      height="60"
      alt={`${countryCode} bayrağı`}
      className="w-full h-full object-cover"
    />
  );
};

export default CountryFlag; 