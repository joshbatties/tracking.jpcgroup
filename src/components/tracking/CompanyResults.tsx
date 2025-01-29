import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Package, FileText, MapPin, Heart } from 'lucide-react';
import styled from 'styled-components';

const AnimatedPopup = styled.div`
  @keyframes flashAndStay {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    20% {
      opacity: 1;
      transform: translateY(0);
      color: rgb(31, 41, 55); /* text-gray-800 equivalent */
    }
    40% {
      color: rgb(107, 114, 128); /* text-gray-500 equivalent */
    }
    60% {
      color: rgb(31, 41, 55); /* text-gray-800 equivalent */
    }
    80% {
      color: rgb(107, 114, 128); /* text-gray-500 equivalent */
    }
    100% {
      opacity: 1;
      transform: translateY(0);
      color: rgb(75, 85, 99); /* text-gray-600 equivalent */
    }
  }

  animation: flashAndStay 2s ease-in-out forwards;
`;

// Types
type ColumnType = 'booking' | 'status' | 'origin' | 'destination';

interface ShipmentData {
  "Booking Number": string;
  "Container Number": string;
  "PO Number": string;
  Status: string;
  POL: string;
  POD: string;
  ETD: string;
  ETA: string;
  "Customer Code": string;
  "Delivery Address": string;
  "Manually Updated"?: string;
}

type ShipmentStatus = 
  | 'Not ready to ship'
  | 'Ready to ship'
  | 'On board vessel'
  | 'Arrived at POD'
  | 'In transit'
  | 'Delivered';

interface ProcessedShipment {
  booking: string;
  status: ShipmentStatus;
  containers: number;
  origin: {
    port: string;
    date: string;
  };
  destination: {
    port: string;
    date: string;
  };
}

interface ExpandedDetails {
  containers: string[];
  poNumbers: string[];
  deliveryAddress: string;
}

interface CompanyResultsProps {
  data: ShipmentData[];
  customerCode?: string;
}

// Constants
const COLUMNS: ColumnType[] = ['booking', 'status', 'origin', 'destination'];
const COLUMN_LABELS: Record<ColumnType, string> = {
  booking: 'Booking',
  status: 'Status',
  origin: 'Origin',
  destination: 'Destination'
};

const PORT_TRANSLATIONS: Record<string, string> = {
  CNNBO: 'Ningbo',
  CNQIN: 'Qingdao',
  CNSHK: 'Shekou',
  CNSZN: 'Shenzhen',
  CNXAM: 'Xiamen',
  CNSHG: 'Shanghai',
  CNYAN: 'Yangshan',
  CNCAN: 'Guangzhou',
  CNXAN: 'Xiamen',
  CNXMN: 'Xiamen',
  CNDAL: 'Dalian',
  CNSHA: 'Shanghai',
  AUSYD: 'Sydney',
  AUBNE: 'Brisbane',
  AUMEL: 'Melbourne',
  AUFRE: 'Fremantle'
};

const COMPANY_NAMES = {
  'PLUMBAMEL': 'Plumbair',
  'TILEFFMEL': 'Tile Effect',
  'ACNATIMEL': 'AC National',
  'BEFLOOMEL': 'BeFloored',
  'HENNYMEL': 'Henny'
} as const;

const STATUS_COLOR_CLASSES = {
  'Not ready to ship': {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200'
  },
  'Ready to ship': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  'On board vessel': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  'In transit': {
    bg: 'bg-fuchsia-50',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200'
  },
  'Arrived at POD': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  'Delivered': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  }
} as const;

const STATUS_PRIORITY: ShipmentStatus[] = [
  "Not ready to ship",
  "Ready to ship",
  "On board vessel",
  "Arrived at POD",
  "In transit",
  "Delivered"
];

const CompanyResults: React.FC<CompanyResultsProps> = ({ data = [], customerCode }) => {
  const [sortColumn, setSortColumn] = useState<ColumnType>('destination');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const filteredData = customerCode 
      ? data.filter(item => item["Customer Code"] === customerCode.toUpperCase())
      : data;

    const bookingGroups = filteredData.reduce<Record<string, ShipmentData[]>>((acc, shipment) => {
      const bookingNumber = shipment["Booking Number"];
      if (!acc[bookingNumber]) {
        acc[bookingNumber] = [];
      }
      acc[bookingNumber].push(shipment);
      return acc;
    }, {});

    return Object.entries(bookingGroups).map(([_, shipments]) => {
      const firstShipment = shipments[0];
      return {
        booking: firstShipment["Booking Number"],
        status: firstShipment.Status as ShipmentStatus,
        containers: shipments.length,
        origin: {
          port: firstShipment.POL,
          date: firstShipment.ETD
        },
        destination: {
          port: firstShipment.POD,
          date: firstShipment.ETA
        }
      };
    });
  }, [data, customerCode]);

  const expandedDetails = useMemo(() => {
    const details = new Map<string, ExpandedDetails>();
    
    data.forEach(shipment => {
      const existing = details.get(shipment["Booking Number"]);
      if (!existing) {
        details.set(shipment["Booking Number"], {
          containers: [shipment["Container Number"]],
          poNumbers: [shipment["PO Number"]],
          deliveryAddress: shipment["Delivery Address"]
        });
      } else {
        if (!existing.containers.includes(shipment["Container Number"])) {
          existing.containers.push(shipment["Container Number"]);
        }
        if (!existing.poNumbers.includes(shipment["PO Number"])) { 
          existing.poNumbers.push(shipment["PO Number"]);
        }
      }
    });
    
    return details;
  }, [data]);

  const statusSummary = useMemo(() => {
    return processedData.reduce<Partial<Record<ShipmentStatus, number>>>((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }, [processedData]);

  const formatDateDisplay = (port: string, date: string, isDeparture: boolean): string => {
    if (!date || date === 'undefined' || date === 'null') {
      const cityName = PORT_TRANSLATIONS[port] || port;
      return `${isDeparture ? 'Departing' : 'Arriving'} <span class="font-bold">${cityName}</span> on <span class="font-bold">TBA</span>`;
    }
  
    const today = new Date();
    
    let normalizedDate = date;
    if (date.includes('2024')) {
      normalizedDate = date.replace('2024', '24');
    } else if (date.includes('2025')) {
      normalizedDate = date.replace('2025', '25');
    }
  
    const [day, month, year] = normalizedDate.split('/');
    if (!day || !month || !year) {
      const cityName = PORT_TRANSLATIONS[port] || port;
      return `${isDeparture ? 'Departing' : 'Arriving'} <span class="font-bold">${cityName}</span> on <span class="font-bold">TBA</span>`;
    }
  
    const shipDate = new Date(parseInt('20' + year), parseInt(month) - 1, parseInt(day));
    if (isNaN(shipDate.getTime())) {
      const cityName = PORT_TRANSLATIONS[port] || port;
      return `${isDeparture ? 'Departing' : 'Arriving'} <span class="font-bold">${cityName}</span> on <span class="font-bold">TBA</span>`;
    }
  
    const isPast = shipDate < today;
    const cityName = PORT_TRANSLATIONS[port] || port;
    
    const action = isDeparture
      ? isPast ? 'Departed' : 'Departing'
      : isPast ? 'Arrived' : 'Arriving';
    
    return `${action} `
      + `<span class="font-bold">${cityName}</span> on `
      + `<span class="font-bold">${day}/${month}/${year}</span>`;
  };

  const formatStatus = (status: ShipmentStatus, containers: number): string => {
    return `${containers} container${containers > 1 ? 's' : ''} ${status.toLowerCase()}`;
  };

  const sortedData = useMemo(() => {
    return [...processedData].sort((a, b) => {
      if (sortColumn === 'destination' && sortDirection === 'asc') {
        const aDelivered = a.status === 'Delivered';
        const bDelivered = b.status === 'Delivered';

        if (aDelivered !== bDelivered) {
          return aDelivered ? 1 : -1;
        }

        const [aDay, aMonth, aYear] = a.destination.date.split('/');
        const [bDay, bMonth, bYear] = b.destination.date.split('/');
        const aETA = new Date(2000 + parseInt(aYear), parseInt(aMonth) - 1, parseInt(aDay));
        const bETA = new Date(2000 + parseInt(bYear), parseInt(bMonth) - 1, parseInt(bDay));
        
        if (aDelivered) {
          return bETA.getTime() - aETA.getTime();
        } else {
          return aETA.getTime() - bETA.getTime();
        }
      }

      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortColumn) {
        case 'booking':
          return direction * a.booking.localeCompare(b.booking);
        case 'status':
          return direction * (
            STATUS_PRIORITY.indexOf(a.status) - STATUS_PRIORITY.indexOf(b.status)
          );
        case 'origin':
          return direction * (new Date(a.origin.date).getTime() - new Date(b.origin.date).getTime());
        case 'destination':
          return direction * (new Date(a.destination.date).getTime() - new Date(b.destination.date).getTime());
        default:
          return 0;
      }
    });
  }, [processedData, sortColumn, sortDirection]);

  const handleSort = (column: ColumnType) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (bookingNumber: string) => {
    setExpandedRow(expandedRow === bookingNumber ? null : bookingNumber);
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-gray-500">No shipments found</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold">
              {processedData.length}
            </h2>
            <span className="text-gray-500">Total Shipments</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto">
            {STATUS_PRIORITY.map(status => (
              statusSummary[status] ? (
                <div 
                  key={status}
                  className={`px-4 py-2 rounded-xl w-full sm:w-44 h-12 sm:h-[80px] 
                    flex items-center sm:flex-col sm:justify-center
                    ${STATUS_COLOR_CLASSES[status].bg} 
                    border ${STATUS_COLOR_CLASSES[status].border}`}
                >
                  <div className={`text-lg font-semibold mr-2 sm:mr-0 sm:text-center ${STATUS_COLOR_CLASSES[status].text}`}>
                    {statusSummary[status]}
                  </div>
                  <div className={`sm:text-center ${STATUS_COLOR_CLASSES[status].text}`}>
                    {status}
                  </div>
                </div>
              ) : null
            ))}
          </div>
        </div>
      </div>

      <div className="h-[44px] relative">
        <AnimatedPopup className="absolute w-full flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <p>Click a row for more information</p>
          </div>
        </AnimatedPopup>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          <div className="hidden sm:grid sm:grid-cols-4 gap-8 px-6 py-4 bg-gray-50">
            {COLUMNS.map(column => (
              <button
                key={column}
                onClick={() => handleSort(column)}
                className="flex items-center gap-2 font-medium text-gray-700 hover:text-black"
              >
                {COLUMN_LABELS[column]}
                {sortColumn === column && (
                  sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </button>
            ))}
          </div>

          <div className="grid sm:hidden grid-cols-4 gap-8 px-6 py-4 bg-gray-50">
            <div className="col-span-2 font-medium text-gray-700">Booking</div>
            <button
              onClick={() => handleSort('origin')}
              className="flex items-center gap-2 font-medium text-gray-700 hover:text-black"
            >
              Origin
              {sortColumn === 'origin' && (
                sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
            <button
              onClick={() => handleSort('destination')}
              className="flex items-center gap-2 font-medium text-gray-700 hover:text-black"
            >
              Destination
              {sortColumn === 'destination' && (
                sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {sortedData.map(item => (
              <React.Fragment key={item.booking}>
                <div 
                  onClick={() => handleRowClick(item.booking)}
                  className="grid sm:hidden grid-cols-4 gap-8 px-6 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="col-span-2">
                    <div className="font-medium mb-2">{item.booking}</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm
                      ${STATUS_COLOR_CLASSES[item.status].bg}
                      ${STATUS_COLOR_CLASSES[item.status].text}
                      border ${STATUS_COLOR_CLASSES[item.status].border}`}
                    >
                      {formatStatus(item.status, item.containers)}
                    </span>
                  </div>
                  <div dangerouslySetInnerHTML={{ 
                    __html: formatDateDisplay(item.origin.port, item.origin.date, true) 
                  }} />
                  <div dangerouslySetInnerHTML={{ 
                    __html: formatDateDisplay(item.destination.port, item.destination.date, false) 
                  }} />
                </div>

                <div 
                  onClick={() => handleRowClick(item.booking)}
                  className="hidden sm:grid grid-cols-4 gap-8 px-6 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="font-medium">{item.booking}</div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm
                      ${STATUS_COLOR_CLASSES[item.status].bg}
                      ${STATUS_COLOR_CLASSES[item.status].text}
                      border ${STATUS_COLOR_CLASSES[item.status].border}`}
                    >
                      {formatStatus(item.status, item.containers)}
                    </span>
                  </div>
                  <div dangerouslySetInnerHTML={{ 
                    __html: formatDateDisplay(item.origin.port, item.origin.date, true) 
                  }} />
                  <div dangerouslySetInnerHTML={{ 
                    __html: formatDateDisplay(item.destination.port, item.destination.date, false) 
                  }} />
                </div>

                {expandedRow === item.booking && expandedDetails.get(item.booking) && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="text-gray-400" size={16} />
                      <span className="font-medium">
                        Container{expandedDetails.get(item.booking)?.containers.length === 1 ? '' : 's'}:
                      </span>
                      <span className="text-gray-600">
                        {expandedDetails.get(item.booking)?.containers.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="text-gray-400" size={16} />
                      <span className="font-medium">
                        PO Number{expandedDetails.get(item.booking)?.poNumbers.length === 1 ? '' : 's'}:
                      </span>
                      <span className="text-gray-600">
                        {expandedDetails.get(item.booking)?.poNumbers.join(', ')}
                      </span>
                    </div>
                      <div className="flex items-baseline gap-2">
                        <MapPin className="text-gray-400 mt-1 shrink-0" size={16} />
                        <span className="font-medium">Delivery Address:</span>
                        <span className="text-gray-600">
                          {expandedDetails.get(item.booking)?.deliveryAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {customerCode && COMPANY_NAMES[customerCode.toUpperCase()] && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center">
              <Heart className="text-rose-500" size={28} />
            </div>
            <h3 className="text-xl font-medium text-gray-900">
              Thank you, {COMPANY_NAMES[customerCode.toUpperCase()]}
            </h3>
            <p className="text-gray-600">
              We deeply value our partnership with you and are committed to ensuring your shipments reach their destination safely and on time. Thank you for your continued support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default CompanyResults;
