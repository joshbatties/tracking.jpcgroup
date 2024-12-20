import React from 'react';

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

const STATUS_LIST = [
  "Not ready to ship",
  "Ready to ship",
  "On board vessel",
  "Arrived at POD",
  "In transit",
  "Delivered",
] as const;

type ShipmentStatus = typeof STATUS_LIST[number];

const PORT_TRANSLATIONS: Record<string, string> = {
  CNNBO: 'Ningbo',
  AUSYD: 'Sydney',
  AUBNE: 'Brisbane',
  AUMEL: 'Melbourne',
  CNSHK: 'Shanghai',
  CNSZN: 'Shenzhen',
  CNXAM: 'Xiamen',
  AUFRE: 'Fremantle'
};

const STATUS_ICONS: Record<ShipmentStatus, string> = {
  "Not ready to ship": "icons/not-ready-to-ship.svg",
  "Ready to ship": "/icons/ready-to-ship.svg",
  "On board vessel": "/icons/on-board-vessel.svg",
  "Arrived at POD": "/icons/arrived-pod.svg",
  "In transit": "/icons/in-transit.svg",
  "Delivered": "/icons/delivered.svg"
};

const STATUS_BORDER_HEX: Record<ShipmentStatus, string> = {
  "Not ready to ship": "#e2e8f0",
  "Ready to ship": "#fde68a",
  "On board vessel": "#bfdbfe",
  "In transit": "#c7d2fe",
  "Arrived at POD": "#a7f3d0",
  "Delivered": "#bbf7d0"
};

function formatDateString(date: string): Date {
  let normalizedDate = date;
  if (date.includes('2024')) {
    normalizedDate = date.replace('2024', '24');
  } else if (date.includes('2025')) {
    normalizedDate = date.replace('2025', '25');
  }
  const [day, month, year] = normalizedDate.split('/');
  return new Date(parseInt('20' + year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
}

function formatOriginOrDestination(port: string, dateStr: string, isOrigin: boolean): { text: string, isPast: boolean } {
  const date = formatDateString(dateStr);
  const today = new Date();
  const cityName = PORT_TRANSLATIONS[port] || port;
  const isPast = date < today;

  let action: string;
  if (isOrigin) {
    action = isPast ? 'Departed' : 'Departing';
  } else {
    action = isPast ? 'Arrived' : 'Arriving';
  }

  return {
    text: `${action} ${cityName} on ${dateStr}`,
    isPast
  };
}

interface ShipmentResultsProps {
  data: ShipmentData[];
}

const ShipmentResults: React.FC<ShipmentResultsProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No shipments found</p>
      </div>
    );
  }

  const bookingNumber = data[0]["Booking Number"];
  const status = data[0].Status as ShipmentStatus;
  const pol = data[0].POL;
  const pod = data[0].POD;
  const etd = data[0].ETD;
  const eta = data[0].ETA;

  const containers = Array.from(new Set(data.map(d => d["Container Number"])));
  const poNumbers = Array.from(new Set(data.map(d => d["PO Number"])));
  const deliveryAddress = data[0]["Delivery Address"];

  const originInfo = formatOriginOrDestination(pol, etd, true);
  const destinationInfo = formatOriginOrDestination(pod, eta, false);

  const currentIndex = STATUS_LIST.indexOf(status);
  const totalSteps = STATUS_LIST.length;
  const filledSegments = currentIndex + 1;
  const fillPercentage = (filledSegments / totalSteps) * 100;


  return (
    <div className="w-full max-w-2xl lg:max-w-4xl mx-auto font-['Urbanist'] space-y-12">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-8 sm:gap-4 p-4 sm:p-0">
        <div className="text-left w-full sm:w-auto">
          <h3 className="text-base sm:text-sm font-medium text-gray-500 mb-1">Origin</h3>
          <p className="text-2xl sm:text-sm text-gray-900 leading-normal" 
             dangerouslySetInnerHTML={{ __html: originInfo.isPast 
                ? `Departed <span class="font-bold">${PORT_TRANSLATIONS[pol] || pol}</span> on <span class="font-bold">${etd}</span>`
                : `Departing <span class="font-bold">${PORT_TRANSLATIONS[pol] || pol}</span> on <span class="font-bold">${etd}</span>` }} 
          />
        </div>
        <div className="text-left w-full sm:w-auto sm:text-right">
          <h3 className="text-base sm:text-sm font-medium text-gray-500 mb-1">Destination</h3>
          <p className="text-2xl sm:text-sm text-gray-900 leading-normal" 
             dangerouslySetInnerHTML={{ __html: destinationInfo.isPast
                ? `Arrived <span class="font-bold">${PORT_TRANSLATIONS[pod] || pod}</span> on <span class="font-bold">${eta}</span>`
                : `Arriving <span class="font-bold">${PORT_TRANSLATIONS[pod] || pod}</span> on <span class="font-bold">${eta}</span>` }} 
          />
        </div>
      </div>

      <div className="relative pt-12 sm:pt-16 scale-90 sm:scale-100 transform origin-top">
        <div className="relative mb-12 sm:mb-16">
          <div className="h-2 bg-gray-200 rounded-full w-full relative"></div>
          <div 
            className="h-2 bg-black rounded-full absolute top-0 left-0 transition-all duration-300"
            style={{ width: `${fillPercentage}%` }}
          />
          <img
            src={STATUS_ICONS[status]}
            alt={status}
            className="w-10 h-10 absolute transform -translate-x-1/2"
            style={{ left: `${fillPercentage}%`, top: '-4rem' }} 
          />
          <div 
            className="absolute font-medium transform -translate-x-1/2 whitespace-nowrap text-sm"
            style={{ 
              left: `${fillPercentage}%`, 
              top: '-1.75rem',
              color: STATUS_BORDER_HEX[status]
            }}
          >
            {status}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <span className="font-medium">Booking Number: </span>
          <span className="text-gray-700">{bookingNumber}</span>
        </div>
        <div>
          <span className="font-medium">PO Number(s): </span>
          <span className="text-gray-700">{poNumbers.join(', ')}</span>
        </div>
        <div>
          <span className="font-medium">Container(s): </span>
          <span className="text-gray-700">{containers.join(', ')}</span>
        </div>
        <div>
          <span className="font-medium">Delivery Address: </span>
          <span className="text-gray-700">{deliveryAddress}</span>
        </div>
      </div>
    </div>
  );
};

export default ShipmentResults;