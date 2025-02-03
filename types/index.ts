export interface Earthquake {
  id: string;
  location: string;
  date: string;
  magnitude: number;
  depth: number;
  coordinates: [number, number];
} 