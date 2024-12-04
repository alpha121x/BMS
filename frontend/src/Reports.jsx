import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BridgeListing from './Reports/BridgeListing';
import CategorySummary from './Reports/CategorySummary';
import DistrictCategory from './Reports/DistrictCategory';
import BridgeCategory from './Reports/BridgeCategory';
import './index.css';

const Reports = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <div className='mb-1'>
                <Header />
            </div>

            <main className="flex-grow p-1">
                <Routes>
                    <Route path="/Reports/BridgeListing" element={<BridgeListing />} />
                    <Route path="/Reports/CategorySummary" element={<CategorySummary />} />
                    <Route path="/Reports/DistrictCategory" element={<DistrictCategory />} />
                    <Route path="/Reports/BridgeCategory" element={<BridgeCategory />} />
                </Routes>
            </main>

            <Footer className="mt-1" />
        </div>
    );
};

export default Reports;
