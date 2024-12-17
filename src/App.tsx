import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ShipmentTracker from './components/tracking/ShipmentTracker';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Routes>
          <Route path="/" element={<ShipmentTracker />} />
        </Routes>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;