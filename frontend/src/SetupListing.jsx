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
import BridgeDimentions from './components/BridgeDimentions';
import './index.css';

const SetupListing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="mb-1">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-grow p-1 mt-[65px]">
        <Routes>
          {/* Define routes for each setup listing */}
          <Route path="/DamageRanks" element={<DamageRanks />} />
          <Route path="/Elements" element={<Elements />} />
          <Route path="/DamageTypes" element={<DamageTypes />} />
          <Route path="/RoadClassifications" element={<RoadClassifications />} />
          <Route path="/CarriagewayTypes" element={<CarriagewayTypes />} />
          <Route path="/BridgeAgeFactors" element={<BridgeAgeFactors />} />
          <Route path="/FactorCrossings" element={<FactorCrossings />} />
          <Route path="/BridgeDimentions" element={<BridgeDimentions />} />

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
