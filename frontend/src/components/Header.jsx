import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname;
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const [isSetupDropdownOpen, setIsSetupDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const reportsRef = useRef(null);
  const setupRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("isAuthenticated", "false");
    navigate("/");
  };

  const userToken = JSON.parse(localStorage.getItem("user"));
  const userName = userToken?.username;

  const isReportsActive = activeTab.startsWith("/Reports");
  const isSetupActive = activeTab.startsWith("/Setup");

  const toggleReportsDropdown = () => {
    setIsReportsDropdownOpen((prev) => !prev);
  };

  const toggleSetupDropdown = () => {
    setIsSetupDropdownOpen((prev) => !prev);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    // Close dropdowns if clicked outside
    if (reportsRef.current && !reportsRef.current.contains(event.target)) {
      setIsReportsDropdownOpen(false);
    }
    if (setupRef.current && !setupRef.current.contains(event.target)) {
      setIsSetupDropdownOpen(false);
    }
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setIsProfileDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="p-1 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mx-2">
        <div className="flex items-center">
          <img src="/punjab.png" alt="Logo" className="h-[35px] w-[45px]" />
          <div className="p-1 rounded">
            <Link to="/Dashboard" className="no-underline">
              <h1 className="text-3xl font-bold uppercase">
                <span className="text-blue-500">CMW BMS - Dashboard</span>
              </h1>
            </Link>
          </div>
        </div>

        <nav className="flex space-x-2 items-center">
          <Link
            to="/Dashboard"
            className={`py-2 px-4 rounded font-bold transition duration-300 no-underline ${
              activeTab === "/Dashboard"
                ? "bg-blue-500 text-white"
                : "hover:bg-green-100 text-blue-500"
            }`}
          >
            Dashboard
          </Link>

          {/* Reports Dropdown */}
          <div className="relative" ref={reportsRef}>
            <button
              onClick={toggleReportsDropdown}
              className={`py-2 px-4 rounded font-bold transition duration-300 ${
                isReportsActive
                  ? "bg-blue-500 text-white"
                  : "hover:bg-green-100 text-blue-500"
              }`}
            >
              Reports
            </button>
            {isReportsDropdownOpen && (
              <div className="absolute mt-2 w-48 bg-white text-gray-700 border rounded-md shadow-lg z-20">
                <Link
                  to="/Reports/BridgeListing"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Bridge Wise Listing
                </Link>
                <Link
                  to="/Reports/CategorySummary"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Category Wise Summary
                </Link>
                <Link
                  to="/Reports/DistrictCategory"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  District Wise Category
                </Link>
                <Link
                  to="/Reports/BridgeCategory"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Bridge Wise Category
                </Link>
              </div>
            )}
          </div>

          {/* Setup Dropdown */}
          <div className="relative" ref={setupRef}>
            <button
              onClick={toggleSetupDropdown}
              className={`py-2 px-4 rounded font-bold transition duration-300 ${
                isSetupActive
                  ? "bg-blue-500 text-white"
                  : "hover:bg-green-100 text-blue-500"
              }`}
            >
              Setup Listing
            </button>
            {isSetupDropdownOpen && (
              <div className="absolute mt-2 w-48 bg-white text-gray-700 border rounded-md shadow-lg z-20">
                <Link
                  to="/SetupListing/DamageRanks"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Damage Ranks
                </Link>
                <Link
                  to="/SetupListing/Elements"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Elements
                </Link>
                <Link
                  to="/SetupListing/DamageTypes"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Damage Types
                </Link>
                <Link
                  to="/SetupListing/RoadClassifications"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Road Classifications
                </Link>
                <Link
                  to="/SetupListing/CarriagewayTypes"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Carriageway Types
                </Link>
                <Link
                  to="/SetupListing/BridgeAgeFactors"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Bridge Age Factors
                </Link>
                <Link
                  to="/SetupListing/FactorCrossings"
                  className="flex px-4 py-2 hover:bg-gray-200 no-underline"
                >
                  Factors for Crossings
                </Link>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative inline-block text-left" ref={profileRef}>
            <Link
              to="#"
              onClick={toggleProfileDropdown}
              className={`py-2 px-4 rounded font-bold transition duration-300 no-underline ${
                activeTab === "#"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-green-100 text-blue-500"
              }`}
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              {userName}
            </Link>
            {isProfileDropdownOpen && (
              <div className="absolute right-8 z-10 mt-2 w-fit bg-white border border-gray-200 rounded-md shadow-lg transition-all duration-200 ease-in-out transform scale-95">
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="flex items-center px-4 py-2 text-red-600 hover:bg-green-100 no-underline transition duration-200"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Logout
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
