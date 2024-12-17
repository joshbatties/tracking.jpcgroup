import { useState, useCallback, useRef } from 'react';
import { TrackingService } from '../services/api/tracking';
import type { ShipmentData, TrackingState } from '../types/tracking';
import type { TrackingParams } from '../services/api/types';

export const useTracking = () => {
  const [state, setState] = useState<TrackingState>({
    data: null,
    error: null,
    loading: false,
    isSearching: false
  });

  const timeoutRef = useRef<number>()

  const searchTracking = useCallback(async (params: TrackingParams) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      isSearching: true 
    }));

    try {
      const response = await TrackingService.getTracking(params);
      
      setState(prev => ({ 
        ...prev,
        data: response.data,
        error: response.error,
        loading: false,
        isSearching: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        data: null,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false,
        isSearching: false
      }));
    }
  }, []);

  const clearSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState({
      data: null,
      error: null,
      loading: false,
      isSearching: false
    });
  }, []);

  return {
    ...state,
    searchTracking,
    clearSearch
  };
};