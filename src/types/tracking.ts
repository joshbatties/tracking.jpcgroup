export interface ShipmentData {
    'Booking Number': string;
    'PO Number': string;
    'Container Number': string;
    'Status': string;
    'POL': string;
    'POD': string;
    'ETD': string;
    'ETA': string;
    'Delivery Address': string;
    'Customer Code'?: string;
  }
  
  export interface TrackingState {
    data: ShipmentData[] | null;
    error: string | null;
    loading: boolean;
    isSearching: boolean;
  }
  
  export interface TrackingResponse {
    headers: string[];
    data: ShipmentData[];
    error?: string;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    error?: string;
  }