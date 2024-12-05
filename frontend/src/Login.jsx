import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faSpinner } from "@fortawesome/free-solid-svg-icons"; 
import { useNavigate } from "react-router-dom";
import logo from "/uu_logo.png"; 
import bmslogo from "/bms.png"; 
import { BASE_URL } from './components/config.jsx';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true); // Start the loading spinner
    setError(""); // Clear any existing error messages
    
    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      // Parse the response
      const data = await response.json();
  
      // Check if the response is not successful
      if (!response.ok) {
        const errorMessage = data.message || "Login failed. Please try again.";
        setError(errorMessage); // Display error to the user
        console.error("Login failed:", errorMessage);
        return;
      }
  
      // Destructure token and user details from the response
      const { token, user } = data;
  
      // Check if a token is received
      if (!token) {
        console.warn("No token received from server.");
        setError("Authentication failed. No token received.");
        return;
      }
  
      // Store the JWT token securely in localStorage
      localStorage.setItem("token", token);
  
      // Store user details, if provided
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        console.warn("User details not provided in the response.");
      }
  
      // Set authentication status
      localStorage.setItem("isAuthenticated", "true");
  
      // Navigate to the dashboard
      if (user && token) {
        navigate("/Dashboard", {}); // Ensure all necessary data is present
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred while processing your login. Please try again.");
    } finally {
      setLoading(false); // Stop the loading spinner
    }
  };
  

  // Handle the Enter key press event
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div
      className="bg-gray-100 min-h-screen flex items-center justify-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/bg111.png')" }}
    >
      {/* Main Container */}
      <div className="container mx-28 p-6">
        {/* Header */}
        <header className="mb-8">
          <nav className="bg-transparent shadow-none p-4">
            <div className="container mx-auto">
              {/* Navbar Brand */}
              <a href="/" className="navbar-brand">
                <img src={logo} alt="logo" className="w-72" />
              </a>
            </div>
          </nav>
        </header>

        {/* Login Card */}
        <div className="flex flex-col lg:flex-row justify-around items-center bg-transparent shadow-lg p-8 rounded-lg">
          {/* Left Column - Image and Title */}
          <div className="text-center lg:text-left lg:w-1/3 mb-6 lg:mb-0">
            <img
              src={bmslogo}
              alt="Agriculture Graduates"
              className="w-100 h-100 mx-auto lg:mx-0 rounded-lg opacity-90"
            />
          </div>

          {/* Right Column - Login Form */}
          <div className="lg:w-1/3">
            <div className="text-center lg:text-left mb-4">
              <h4 className="text-xl font-bold text-gray-700">Login</h4>
              <p>Enter username and password to login</p>
            </div>
            {/* Login Fields */}
            <div className="space-y-4">
              {/* Username Input */}
              <div className="relative flex items-center">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="pl-10 w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Password Input */}
              <div className="relative mt-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="pl-10 w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
                disabled={loading} 
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                ) : (
                  "Login"
                )}
              </button>

              {/* Error Message Handling */}
              {error && <div className="mt-2 text-red-500">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
