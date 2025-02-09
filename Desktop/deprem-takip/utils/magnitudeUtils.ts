export function getMagnitudeColor(magnitude: number): string {
  if (magnitude < 3.5) {
    return 'magnitude-low';
  } else if (magnitude >= 3.5 && magnitude <= 5.4) {
    return 'magnitude-medium';
  } else if (magnitude >= 5.6) {
    return 'magnitude-high';
  } else {
    return 'text-gray-700 dark:text-gray-300';
  }
}
