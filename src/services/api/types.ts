import type { ShipmentData } from '../../types/tracking';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface TrackingParams {
  trackingNumber?: string;
  companyCode?: string;
}

export interface ValidationError {
  message: string;
  field?: string;
}