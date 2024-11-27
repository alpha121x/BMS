import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import Login from './Login'; // Import Login Component
import Dashboard from './Dashboard';

// Authentication Checker Component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  return isAuthenticated === "true" ? children : <Navigate to="/" />;
};
     {/* 
      Designed and Developed By: Abbas Ch .
      React and Node Js Developer
      abbasshakor0123@gmail.com
      Date : 11/21/2024
      */}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Default Route to Login */}
        <Route path="/" element={<Login />} />

        {/* Private Routes (Require Authentication) */}
        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  </React.StrictMode>
);
