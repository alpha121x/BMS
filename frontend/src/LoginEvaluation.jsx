import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faSpinner } from "@fortawesome/free-solid-svg-icons"; 
import { useNavigate } from "react-router-dom";
import logo from "/uu_logo.png"; 
import bmslogo from "/bms.png"; 
import { BASE_URL } from './components/config';

const LoginEvaluation = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginEvaluation = async () => {
    setLoading(true);
    setError(""); 
    try {
      const response = await fetch(`${BASE_URL}/api/loginEvaluation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.message); 
        console.error("Login failed:", data.message);
        setLoading(false); 
        return;
      }
  
      // Store the JWT token and user data
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAuthenticated", "true");
      }
  
      if (data.user) {
        localStorage.setItem("userEvaluation", JSON.stringify(data.user));
        navigate("/Evaluation");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false); 
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
              <h4 className="text-xl font-bold text-gray-700">BMS Evaluation Module</h4>
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
                onClick={handleLoginEvaluation}
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

export default LoginEvaluation;
