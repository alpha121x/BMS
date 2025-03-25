import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import cnw_2 from "/cnw_2.png";
import { BASE_URL } from "./components/config.jsx";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
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

      // Store the JWT token
      if (data.token) {
        localStorage.setItem("token", data.token);
      } else {
        console.warn("No token received from server");
      }

      // Store user details including roleId and districtId if they're included in the response
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/Dashboard", {});
      }

      localStorage.setItem("isAuthenticated", "true");
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
      style={{
        height: "100vh",
        backgroundImage: "url('/bg11_new.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Main Container */}
      <div className="container">
        <header>
          <nav className="bg-transparent shadow-none p-4">
            <div className="container mx-auto">
              {/* Navbar Brand */}
              <a href="/" className="navbar-brand">
                <img src={cnw_2} alt="logo" style={{ width: "300px" }} />
              </a>
            </div>
          </nav>
        </header>

        {/* Login Card */}
        <div
          className="d-flex justify-content-around align-items-center shadow-lg p-8 rounded bg-[#f3f3f3]"
          style={{ height: "450px" }}
        >
          {/* Left Column - Image and Title */}
          <div className="text-center lg:text-left lg:w-1/3 mb-6 lg:mb-0">
            {/*<img src={bmslogo} alt="Agriculture Graduates" className="w-100 h-100 mx-auto lg:mx-0 rounded-lg opacity-90"/>*/}
            <div>
              <h5 className="text-uppercase fw-bold text-[#005D7F] mb-3">
                Bridge Management Systems
              </h5>
              <p className="fs-6">
                The BMS Software is a specialized tool developed to support the
                comprehensive management of bridge infrastructure.It is specifically designed to help engineers, 
                inspectors, and maintenance planners streamline the critical activities.
              </p>
              
              <p className="mt-5 fs-6">
                Designed and Developed by{" "}
                <a href="" className="text-[#005D7F]">
                  The Urban Unit
                </a>
              </p>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="lg:w-1/3">
            <div className="text-center lg:text-left mb-4">
              <h4 className="text-xl font-bold text-gray-700">
                Dashboard Login
              </h4>
              <p>Enter username and password to login</p>
            </div>
            {/* Login Fields */}
            <div className="space-y-4">
              {/* Username Input */}
              <div className="relative flex items-center">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#005D7F]">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="pl-10 w-full py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Password Input */}
              <div className="relative mt-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#005D7F]">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="pl-10 w-full py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                className="w-full py-2 bg-[#005D7F] text-white font-semibold rounded-lg hover:bg-[#00A2BE] transition flex items-center justify-center"
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
