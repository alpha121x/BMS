import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BridgeListing from './components/BridgeListing';
import CategorySummary from './components/CategorySummary';
import DistrictCategory from './components/DistrictCategory';
import BridgeCategory from './components/BridgeCategory.jsx';
import './index.css';
import CostEstimation from './components/CostEstimation.jsx';

const Reports = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <div className='mb-1'>
                <Header />
            </div>

            <main className="flex-grow p-1">
                <Routes>
                    <Route path="/CostEstimation" element={<CostEstimation />} />
                    <Route path="/BridgeListing" element={<BridgeListing />} />
                    <Route path="/CategorySummary" element={<CategorySummary />} />
                    <Route path="/DistrictCategory" element={<DistrictCategory />} />
                    <Route path="/BridgeCategory" element={<BridgeCategory />} />
                </Routes>
            </main>

            <Footer className="mt-1" />
        </div>
    );
};

export default Reports;