import React, { useState, useEffect } from 'react';

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
  "Not ready to ship": "#64748b",
  "Ready to ship": "#ef4444",
  "On board vessel": "#eab308",
  "In transit": "#d946ef",
  "Arrived at POD": "#3b82f6",
  "Delivered": "#10b981"
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
  const [currentStep, setCurrentStep] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial mobile state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint in Tailwind
    };

    // Check initial state
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const finalStepIndex = STATUS_LIST.indexOf(status);
  const totalSteps = STATUS_LIST.length;

  useEffect(() => {
    // Only run animation on desktop
    if (isMobile) {
      setCurrentStep(finalStepIndex);
      setProgressWidth((finalStepIndex / (totalSteps - 1)) * 100);
      return;
    }

    setCurrentStep(0);
    setProgressWidth(0);

    const animateStep = (step: number) => {
      return new Promise<void>((resolve) => {
        const startPosition = (step / (totalSteps - 1)) * 100;
        const endPosition = ((step + 1) / (totalSteps - 1)) * 100;
        const startTime = Date.now();
        const duration = 500; // 500ms per step

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Linear progress between steps
          const currentWidth = startPosition + (endPosition - startPosition) * progress;
          setProgressWidth(currentWidth);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };

        requestAnimationFrame(animate);
      });
    };

    const runAnimation = async () => {
      await new Promise(resolve => setTimeout(resolve, 125)); // Initial delay
      
      for (let step = 0; step <= finalStepIndex; step++) {
        setCurrentStep(step);
        if (step < finalStepIndex) {
          await animateStep(step);
        }
      }
    };

    runAnimation();
  }, [finalStepIndex, totalSteps, isMobile]);

  const getStatusOpacity = (index: number) => {
    if (isMobile) {
      // On mobile, only show the final status
      return index === finalStepIndex ? 1 : 0;
    }
    // On desktop, show current step with full opacity
    return index === currentStep ? 1 : 0.08;
  };

  const fillPercentage = isMobile 
    ? (finalStepIndex / (totalSteps - 1)) * 100 
    : progressWidth;

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
          <div className="h-2 bg-gray-200 rounded-full w-full relative overflow-hidden">
            <div 
              className="h-2 bg-black rounded-full absolute top-0 left-0"
              style={{ 
                width: `${fillPercentage}%`,
                transition: isMobile ? 'none' : undefined
              }}
            />
          </div>
          
          {STATUS_LIST.map((stepStatus, index) => {
            const stepPosition = (index / (totalSteps - 1)) * 100;
            const opacity = getStatusOpacity(index);
            
            return (
              <div
                key={stepStatus}
                className="absolute transform -translate-x-1/2 transition-all duration-200"
                style={{ left: `${stepPosition}%` }}
              >
                <img
                  src={STATUS_ICONS[stepStatus]}
                  alt={stepStatus}
                  className="w-10 h-10 absolute top-[-4rem]"
                  style={{ 
                    transform: `scale(${opacity > 0.5 ? 1.1 : 0.9})`,
                    opacity,
                    display: isMobile && index !== finalStepIndex ? 'none' : undefined
                  }}
                />
                <div 
                  className="absolute font-medium whitespace-nowrap text-sm"
                  style={{ 
                    top: '-1.75rem',
                    color: STATUS_BORDER_HEX[stepStatus as ShipmentStatus],
                    opacity,
                    display: isMobile && index !== finalStepIndex ? 'none' : undefined
                  }}
                >
                  {stepStatus}
                </div>
              </div>
            );
          })}
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