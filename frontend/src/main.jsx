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

// Authentication Checker Component for regular routes
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === "true";
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Always redirect to the login page for Evaluation Module
const PrivateEvaluationRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isEvaluationAuthenticated") === "true";
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

        {/* Catch-All for Undefined Routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
