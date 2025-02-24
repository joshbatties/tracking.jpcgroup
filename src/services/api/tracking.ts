import { RateLimiter } from '../../utils/rateLimiter';
import { validateSearchQuery } from '../../utils/validation';
import type { ShipmentData, TrackingResponse } from '../../types/tracking';
import type { ApiResponse, TrackingParams } from './types';

const BASE_URL = 'https://test-multi-company-6jpi.vercel.app/api/tracking';
const rateLimiter = RateLimiter.getInstance();

export class TrackingService {
  private static async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async getTracking(params: TrackingParams): Promise<ApiResponse<ShipmentData[]>> {
    if (!await rateLimiter.canMakeRequest()) {
      return {
        data: null,
        error: 'Too many requests. Please try again later.',
        loading: false
      };
    }

    try {
      const queryParam = params.trackingNumber || params.companyCode;
      const queryType = params.trackingNumber ? 'trackingNumber' : 'customerCode';
      
      const validationResult = validateSearchQuery(queryParam || '');
      if (!validationResult.isValid) {
        return {
          data: null,
          error: validationResult.error || 'Invalid input',
          loading: false
        };
      }

      const url = `${BASE_URL}?${queryType}=${encodeURIComponent(queryParam || '')}`;
      const response = await this.fetchWithTimeout(url);
      const data: TrackingResponse = await response.json();

      if (data.error) {
        return {
          data: null,
          error: data.error,
          loading: false
        };
      }

      return {
        data: data.data,
        error: null,
        loading: false
      };

    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false
      };
    }
  }
}