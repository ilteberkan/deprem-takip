import React from 'react';
import { TurkishFlag, UnknownFlag } from './Flags';

interface CountryFlagProps {
  countryCode: string;
}

const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode }) => {
  switch (countryCode.toUpperCase()) {
    case 'TR':
      return <TurkishFlag />;
    default:
      return <UnknownFlag />;
  }
};

export default CountryFlag; 