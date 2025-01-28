import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Head from './components/common/Head';
import ShipmentTracker from './components/tracking/ShipmentTracker';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Head /> 
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col overflow-auto">
          <Routes>
            <Route path="/" element={<ShipmentTracker />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
