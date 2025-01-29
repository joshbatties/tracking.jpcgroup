import React from 'react';

const Header = () => (
  <header className="w-full flex justify-center py-4 px-4">
    <a 
      href="https://jpcgroup.com" 
      className="transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
    >
      <img 
        src="icons/jpc-logo.png" 
        alt="JPC International" 
        className="h-7 md:h-10"
      />
    </a>
  </header>
);

export default Header;