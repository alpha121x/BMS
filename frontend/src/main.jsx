import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import Login from './Login'; // Login Component
import Dashboard from './Dashboard'; // Dashboard Component
import Reports from './Reports'; // Reports Component
import SetupListing from './SetupListing';

// Authentication Checker Component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === "true";
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

          {/* Private Route for Reports */}
          <Route
          path="/SetupListing/*"
          element={
            <PrivateRoute>
              <SetupListing />
            </PrivateRoute>
          }
        />

        {/* Catch-All for Undefined Routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
