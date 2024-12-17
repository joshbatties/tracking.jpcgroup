import { ShipmentData } from '../types/tracking';
import { formatDate } from './formatting';

const STATUS_PRIORITY = [
  "Not ready to ship",
  "Ready to ship",
  "On board vessel",
  "In transit",
  "Arrived at POD",
  "Delivered"
];

export const getStatusPriority = (status: string): number => {
  const index = STATUS_PRIORITY.indexOf(status);
  return index === -1 ? STATUS_PRIORITY.length : index;
};

export const compareValues = (a: string, b: string, isDate: boolean): number => {
  if (isDate) {
    if (a.toUpperCase() === 'TBA') return 1;
    if (b.toUpperCase() === 'TBA') return -1;
    
    const dateA = new Date(formatDate(a)).getTime();
    const dateB = new Date(formatDate(b)).getTime();
    return dateA - dateB;
  }
  return a.localeCompare(b);
};

export const sortShipments = (
  shipments: ShipmentData[],
  column: keyof ShipmentData,
  order: 'asc' | 'desc'
): ShipmentData[] => {
  return [...shipments].sort((a, b) => {
    const valueA = String(a[column] || '');
    const valueB = String(b[column] || '');
    
    let comparison: number;

    if (column === 'Status') {
      comparison = getStatusPriority(valueA) - getStatusPriority(valueB);
    } else {
      const isDate = column === 'ETD' || column === 'ETA';
      comparison = compareValues(valueA, valueB, isDate);
    }

    return order === 'asc' ? comparison : -comparison;
  });
};