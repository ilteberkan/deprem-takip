import { useQuery } from 'react-query';
import { fetchMajorEarthquakes } from '../services/earthquakeService';

export default function MajorEarthquakes() {
  const { data: earthquakes, isLoading, isError } = useQuery('majorEarthquakes', fetchMajorEarthquakes);
}
