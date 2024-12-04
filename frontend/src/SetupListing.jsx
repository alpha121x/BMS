import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import DamageRanks from './components/DamageRanks';
import Elements from './components/Elements';
import DamageTypes from './components/DamageTypes';
import RoadClassifications from './components/RoadClassifications';
import CarriagewayTypes from './components/CarriagewayTypes';
import BridgeAgeFactors from './components/BridgeAgeFactors';
import FactorCrossings from './components/FactorCrossings';
import './index.css';

const SetupListing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="mb-1">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-grow p-1">
        <Routes>
          {/* Define routes for each setup listing */}
          <Route path="/SetupListing/DamageRanks" element={<DamageRanks />} />
          <Route path="/SetupListing/Elements" element={<Elements />} />
          <Route path="/SetupListing/DamageTypes" element={<DamageTypes />} />
          <Route path="/SetupListing/RoadClassifications" element={<RoadClassifications />} />
          <Route path="/SetupListing/CarriagewayTypes" element={<CarriagewayTypes />} />
          <Route path="/SetupListing/BridgeAgeFactors" element={<BridgeAgeFactors />} />
          <Route path="/SetupListing/FactorCrossings" element={<FactorCrossings />} />

          {/* Default Route: Redirect to DamageRanks */}
          <Route path="/" element={<DamageRanks />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer className="mt-1" />
    </div>
  );
};

export default SetupListing;
