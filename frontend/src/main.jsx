import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import LoginEvaluation from './LoginEvaluation'; // Login Component for Evaluation
import Login from './Login'; // Main Login Component
import Dashboard from './Dashboard'; // Dashboard Component
import Reports from './Reports'; // Reports Component
import SetupListing from './SetupListing'; // SetupListing Component
import Evaluation from './Evaluation'; // Evaluation Module Component
import EditBridge from './EditIBridge';
import BridgeInfo from './components/BridgeInfo';
import BridgeInfoDashboard from './components/BridgeinfoDashboard';
import BridgeWiseScore from './components/BridgeWiseScore';
import BridgeInformation from './components/BridgeInformation';
import BridgeInformationCon from './components/BridgeInformationCon';
import BridgeInformationRams from './components/BridgeInformationRams';
import CostEstimation from './components/CostEstimation';
import PriortizationTable from './components/PriotizationTable';
import PrioritizationInformation from './components/PrioritizationInformation';
import MaintenancePlan from './components/MaintenancePlan';
import FiveYearPlan from './components/FiveYearPlan'; // Importing the Five Year Plan component
import BridgeInfoHistory from './components/BridgeInfoHistory';
import BridgeInfoInspected from './components/BridgeInfoInspected';

// Authentication Checker Component for regular routes
const PrivateRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') == "true";
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Always redirect to the login page for Evaluation Module
const PrivateEvaluationRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem("isEvaluationAuthenticated") == "true";
  // If authenticated, allow access to Evaluation, otherwise redirect to loginEvaluation
  return isAuthenticated ? children : <Navigate to="/loginEvaluation" />;
};


// 404 Page Component
const NotFound = () => (
  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
    <h1>404</h1>
    <p>Page not found.</p>
    <a href="/">Go Back to Login</a>
  </div>
);

/* 
  Designed and Developed By: Abbas Ch.
  React and Node.js Developer
  abbasshakor0123@gmail.com
  Date: 11/21/2024
*/

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Default Route to Login */}
        <Route path="/" element={<Login />} />

        {/* Private Route for Dashboard */}
        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Private Route for Reports */}
        <Route
          path="/Reports/*"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />

        {/* Private Route for SetupListing */}
        <Route
          path="/SetupListing/*"
          element={
            <PrivateRoute>
              <SetupListing />
            </PrivateRoute>
          }
        />

        {/* Login Route for Evaluation Module */}
        <Route path="/loginEvaluation" element={<LoginEvaluation />} />

        {/* Private Route for Evaluation Module - Always Redirects to Login */}
        <Route
          path="/Evaluation/*"
          element={
            <PrivateEvaluationRoute>
              <Evaluation />
            </PrivateEvaluationRoute>
          }
        />

          {/* Private Route for EditBridge */}
          <Route
          path="/EditBridge"
          element={
            <PrivateRoute>
              <EditBridge />
            </PrivateRoute>
          }
        />

         {/* Private Route for BridgeInfo */}
         <Route
          path="/BridgeInfo"
          element={
            <PrivateRoute>
              <BridgeInfo />
            </PrivateRoute>
          }
        />

        {/* Private Route for BridgeInfoHistory */}
         <Route
          path="/BridgeInfoHistory"
          element={
            <PrivateRoute>
              <BridgeInfoHistory />
            </PrivateRoute>
          }
        />

          {/* Private Route for BridgeInfoInsStruc */}
         <Route
          path="/BridgeInfoInspected"
          element={
            <PrivateRoute>
              <BridgeInfoInspected />
            </PrivateRoute>
          }
        />

          {/* Private Route for BridgeInfo */}
          <Route
          path="/BridgeInfoEvaluation"
          element={
            <PrivateEvaluationRoute>
              <BridgeInfo />
            </PrivateEvaluationRoute>
          }
        />

          {/* Private Route for BridgeWise Score */}
          <Route
          path="/BridgeWiseScore"
          element={
            <PrivateRoute>
              <BridgeWiseScore />
            </PrivateRoute>
          }
        />

          {/* Route for Cost Estimation */}
          <Route
          path="/CostEstimation"
          element={
            <PrivateRoute>
              <CostEstimation />
              </PrivateRoute>
          }
        />

            {/* Private Route for Five Year Plan */}
          <Route
          path="/fiveyearplan"
          element={
            <PrivateRoute>
              <FiveYearPlan />
              </PrivateRoute>
          }
        />


           {/* Private Route for Cost Estimation */}
          <Route
          path="/PrioritizationInformation"
          element={
              <PrioritizationInformation />
          }
        />

           {/* Private Route for Cost Estimation */}
          <Route
          path="/Priortization"
          element={
            <PrivateRoute>
              <PriortizationTable  />
              </PrivateRoute>
          }
        />

             {/* Private Route for MaintenancePlan */}
          <Route
          path="/MaintenancePlan"
          element={
            <PrivateRoute>
              <MaintenancePlan  />
              </PrivateRoute>
          }
        />


         {/* Private Route for BridgeInformation */}
         <Route
          path="/BridgeInformation"
          element={
            <PrivateRoute>
              <BridgeInformation />
            </PrivateRoute>
          }
        />

         {/* Private Route for BridgeInformation */}
         <Route
          path="/BridgeInformationCon"
          element={
              <BridgeInformationCon />
          }
        />

         {/* Private Route for BridgeInformation */}
         <Route
          path="/BridgeInformationRams"
          element={
            <PrivateRoute>
              <BridgeInformationRams />
            </PrivateRoute>
          }
        />

           {/* Private Route for BridgeInfo */}
           <Route
          path="/BridgeInfoDashboard"
          element={
            <PrivateRoute>
              <BridgeInfoDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-All for Undefined Routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
