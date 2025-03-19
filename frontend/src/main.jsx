import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import Login from './Login'; // Main Login Component
import Dashboard from './Dashboard'; // Dashboard Component
import Reports from './Reports'; // Reports Component
import SetupListing from './SetupListing'; // SetupListing Component
import BridgeInfoDashboard from './components/BridgeinfoDashboard';
import BridgeWiseScore from './components/BridgeWiseScore';
import BridgeInformation from './components/BridgeInformation';

// Authentication Checker Component for regular routes
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') == "true";
  return isAuthenticated ? children : <Navigate to="/" />;
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

          {/* Private Route for BridgeWise Score */}
          <Route
          path="/BridgeWiseScore"
          element={
            <PrivateRoute>
              <BridgeWiseScore />
            </PrivateRoute>
          }
        />

         {/* Private Route for BridgeWise Score */}
         <Route
          path="/BridgeInformation"
          element={
            <PrivateRoute>
              <BridgeInformation />
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
