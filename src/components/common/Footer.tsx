import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const watermarkPath = '/icons/jpc-group-watermark.svg';
  const logomark = "/icons/jpc-logomark.svg";

  return (
    <footer className={`flex flex-col bg-black relative bg-[image:var(--watermark-bg)] bg-[75%_35%] bg-no-repeat bg-[length:auto_325%] ${className}`}
            style={{ 
              '--watermark-bg': `url(${watermarkPath})`,
              fontFamily: 'Manrope, sans-serif'
            } as React.CSSProperties}>
      <div className="flex flex-col md:flex-row items-center gap-8 p-[5vh] px-[5vw]">
        <a href="#" 
           aria-current="page" 
           className="relative float-left w-auto h-[7.5vh] z-[2001]">
          <img 
            src={logomark}
            alt="JPC Group Logo (White)"
            className="h-full w-auto align-middle"
          />
        </a>
        <address className="not-italic">
          <p className="text-[15px] md:text-[0.85rem] leading-[22px] md:leading-[1.25rem] font-medium text-white m-0">
            L16, 1 Collins Street, Melbourne, 3000
          </p>
        </address>
      </div>
      
      <div className="border-t-[0.15rem] border-t-white py-[2.5vh] px-[5vw]">
        <p className="text-[13px] md:text-[0.85rem] leading-[18px] md:leading-[1.25rem] font-medium text-white text-center m-0">
          We acknowledge First&nbsp;Nations&nbsp;Peoples as the Traditional&nbsp;Custodians and Lore&nbsp;Keepers of the oldest living culture and pay respects to their Elders past and present. We extend that respect to all First&nbsp;Nations&nbsp;Peoples.
        </p>
      </div>
    </footer>
  );
};

export default Footer;