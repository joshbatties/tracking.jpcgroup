import React, { useState, useCallback } from 'react';
import { Search, RotateCcw, Building2, HelpCircle, Ship } from 'lucide-react';
import { useTracking } from '../../hooks/useTracking';
import type { TrackingParams } from '../../services/api/types';
import CompanyResults from './CompanyResults';
import type { ShipmentData } from './types';
import ShipmentResults from './ShipmentResults';
import HelpForm from './HelpForm';
import LoadingSpinner from './LoadingSpinner';

interface TrackingHookReturn {
  data: ShipmentData[] | null;
  error: string | null;
  loading: boolean;
  isSearching: boolean;
  searchTracking: (params: TrackingParams) => Promise<void>;
  clearSearch: () => void;
}

const normalizeBookingNumber = (input: string): string => {
  // Remove any whitespace and convert to uppercase
  const cleaned = input.trim().toUpperCase();
  
  // Check if it's in SXXXX format (where X is any character)
  if (/^S\d{4}$/.test(cleaned)) {
    // Convert to S0000XXXX format by padding with zeros
    return `S0000${cleaned.slice(1)}`;
  }
  
  // If it's already in S0000XXXX format or any other format, return as is
  return cleaned;
};

const ShipmentTracker: React.FC = () => {
  const [isCompanyMode, setIsCompanyMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showHelpForm, setShowHelpForm] = useState(false);

  const { data, error, loading, isSearching, searchTracking, clearSearch } = useTracking() as TrackingHookReturn;

  const handleSearch = useCallback(() => {
    if (!inputValue.trim() || isSearching) return;
  
    const normalizedInput = isCompanyMode 
      ? inputValue.trim().toUpperCase()
      : normalizeBookingNumber(inputValue);
    
    const params: TrackingParams = isCompanyMode 
      ? { companyCode: normalizedInput }
      : { trackingNumber: normalizedInput };
  
    searchTracking(params);
  }, [inputValue, isCompanyMode, isSearching, searchTracking]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !isSearching) {
      handleSearch();
    }
  }, [handleSearch, inputValue, isSearching]);

  const toggleMode = useCallback(() => {
    setIsCompanyMode(prev => !prev);
    setInputValue('');
    clearSearch();
  }, [clearSearch]);

  const clearInput = useCallback(() => {
    setInputValue('');
    clearSearch();
  }, [clearSearch]);

  const placeholderText = isCompanyMode 
    ? "Enter your 9 letter company code" 
    : "Enter your container, PO or Booking number";

  return (
    <div className="flex-grow flex flex-col items-center pt-16 md:pt-32 pb-64 md:pb-96 px-4 md:px-6 font-['Urbanist']">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 md:mb-12 tracking-tight">
        {isCompanyMode ? 'Track your shipments' : 'Track a shipment'}
      </h1>

      <div className="w-full max-w-2xl lg:max-w-4xl">
        <div className="relative mb-8 md:mb-12">
          <div className="flex items-center h-12 md:h-14 rounded-full border border-gray-200 shadow-sm hover:shadow-lg focus-within:shadow-lg pr-2 pl-4 transition-all duration-200">
            <Search className="text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="flex-grow px-2 md:px-4 outline-none text-sm md:text-lg"
              placeholder={window.innerWidth > 768 ? placeholderText : ''}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label={isCompanyMode ? "Company code input" : "Tracking number input"}
            />
            <button 
              onClick={clearInput}
              className="text-gray-400 hover:scale-110 transition-transform mr-2"
              disabled={loading || !inputValue}
              aria-label="Clear input"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSearch}
              disabled={loading || !inputValue.trim()}
              className="bg-black text-white px-6 md:px-8 py-2 rounded-full hover:bg-gray-200 hover:text-black transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center md:hidden">
            {placeholderText}
          </div>
          {error && (
            <div className="absolute top-full mt-2 text-sm text-red-500 w-full text-center">
              {error}
            </div>
          )}
        </div>

        <div className="relative transition-all duration-500 ease-in-out">
          <div className={`transition-all duration-500 ease-in-out ${loading ? 'opacity-100 h-40 mb-12' : 'opacity-0 h-0 overflow-hidden'}`}>
            <LoadingSpinner />
          </div>

          <div className={`transition-all duration-500 ease-in-out ${!loading && data ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            {data && isCompanyMode && (
              <div className="w-full mb-8">
                <CompanyResults 
                  data={data} 
                  customerCode={inputValue}
                />
              </div>
            )}

            {data && !isCompanyMode && (
              <div className="w-full mb-8">
                <ShipmentResults data={data} />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-8 mt-8">
          <div className="flex flex-col items-center w-44">
            <button 
              onClick={toggleMode}
              className="flex flex-col items-center group transition-transform duration-200 hover:scale-105"
              disabled={loading}
            >
              <div className="p-5 rounded-full bg-gray-50 group-hover:bg-gray-100 group-hover:shadow-md transition-all duration-200">
                {isCompanyMode ? 
                  <Ship className="w-7 h-7 text-gray-600" /> : 
                  <Building2 className="w-7 h-7 text-gray-600" />
                }
              </div>
            </button>
            <h2 className="text-sm font-medium text-gray-900 mt-3 mb-1">
              {isCompanyMode ? "Track a Shipment" : "Track by Company Code"}
            </h2>
            <p className="text-xs text-gray-500 text-center">
              {isCompanyMode ? 
                "Search by container, PO or Booking number" : 
                "See all of your company's shipments"
              }
            </p>
          </div>

          <div className="flex flex-col items-center w-44">
            <button 
              onClick={() => setShowHelpForm(!showHelpForm)}
              className="flex flex-col items-center group transition-transform duration-200 hover:scale-105"
            >
              <div className="p-5 rounded-full bg-gray-50 group-hover:bg-gray-100 group-hover:shadow-md transition-all duration-200">
                <HelpCircle className="w-7 h-7 text-gray-600" />
              </div>
            </button>
            <h2 className="text-sm font-medium text-gray-900 mt-3 mb-1">
              Need Help Tracking?
            </h2>
            <p className="text-xs text-gray-500 text-center">
              Speak to one of our team
            </p>
          </div>
        </div>

        {showHelpForm && <HelpForm />}
      </div>
    </div>
  );
};

export default ShipmentTracker;