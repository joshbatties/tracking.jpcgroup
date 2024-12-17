export type ShipmentStatus = 
  | 'Not ready to ship'
  | 'Ready to ship'
  | 'On board vessel'
  | 'In transit'
  | 'Arrived at POD'
  | 'Delivered';

export interface ShipmentData {
  bookingNumber: string;
  status: ShipmentStatus;
  POL: string;
  POD: string;
  ETD: string;
  ETA: string;
}