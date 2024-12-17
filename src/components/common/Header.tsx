import React from 'react';
const logo = "/icons/jpc-logo.png";

const Header: React.FC = () => (
  <header className="w-full flex justify-center py-4 px-4">
    <img src={logo} alt="JPC International" className="h-7 md:h-10" />
  </header>
);

export default Header;