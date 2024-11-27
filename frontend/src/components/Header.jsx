import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname;
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const [isSetupDropdownOpen, setIsSetupDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // State for profile dropdown

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("isAuthenticated", "false");
    navigate("/");
  };

  const userToken = JSON.parse(localStorage.getItem("user"));
  const userName = userToken?.username;

  const isReportsActive = activeTab.startsWith("/Reports");

  const toggleReportsDropdown = () => {
    setIsReportsDropdownOpen(!isReportsDropdownOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleSetupDropdown = () => {
    setIsSetupDropdownOpen(!isSetupDropdownOpen);
  };

  return (
    <header className="p-2 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mx-2">
        <div className="flex items-center">
          <img src="/punjab.png" alt="Logo" className="h-[35px] w-[45px]" />
          <div className="p-2 rounded">
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


          <div className="relative">
            <button
              onClick={toggleReportsDropdown}
              className={`py-2 px-4 rounded font-bold transition duration-300 ${
                isReportsActive
                  ? "bg-green-600 text-white"
                  : "hover:bg-green-100 text-blue-500"
              }`}
            >
              Reports
            </button>
            {isReportsDropdownOpen && (
              <div className="absolute mt-2 w-48 bg-white text-gray-700 border rounded-md shadow-lg z-20">
                <Link
                  to="/Reports/Summary"
                  className="flex  px-4 py-2 hover:bg-gray-200"
                >
                  Bridge Wise Listing
                </Link>
                <Link
                  to="/Reports/Detailed"
                  className="flex px-4 py-2 hover:bg-gray-200"
                >
                  Category Wise Summary
                </Link>
                <Link
                  to="/Reports/Export"
                  className="flex px-4 py-2 hover:bg-gray-200"
                >
                  District Wise Category
                </Link>
                <Link
                  to="/Reports/Export"
                  className="flex px-4 py-2 hover:bg-gray-200"
                >
                  Bridge Wise Category
                </Link>
              </div>
            )}

          </div>


          <div className="relative">
            <button
              onClick={toggleSetupDropdown}
              className={`py-2 px-4 rounded font-bold transition duration-300 ${
                isReportsActive
                  ? "bg-green-600 text-white"
                  : "hover:bg-green-100 text-blue-500"
              }`}
            >
              Setup Listing
            </button>
            {isSetupDropdownOpen && (
              <div className="absolute mt-2 w-48 bg-white text-gray-700 border rounded-md shadow-lg z-20">
                <Link
                  to="/Reports/Summary"
                  className="flex  px-4 py-2 hover:bg-gray-200"
                >
                  Damage Ranks
                </Link>
                <Link
                  to="/Reports/Detailed"
                  className="flex px-4 py-2 hover:bg-gray-200"
                >
                  Elements
                </Link>
                <Link
                  to="/Reports/Export"
                  className="flex px-4 py-2 hover:bg-gray-200"
                >
                  Damage Types
                </Link>
                <Link
                  to="/Reports/Export"
                  className="flex px-4 py-2 hover:bg-gray-200"
                >
                  Road Classifications
                </Link>
                <Link
                  to="/Reports/Export"
                  className="flex px-4 py-2 hover:bg-gray-200"
                >
                  Carriageway Types
                </Link>
                <Link
                  to="/Reports/Export"
                  className="flex px-4 py-2 hover:bg-gray-200"
                >
                  Bridge Age Factors
                </Link>
                <Link
                  to="/Reports/Export"
                  className="flex px-4 py-2 hover:bg-gray-200"
                >
                  Factors for Crossings
                </Link>
              </div>
            )}

          </div>

          {/* Profile Dropdown */}
          <div className="relative inline-block text-left">
            {/* Profile Link */}
            <Link
              to="#"
              onClick={toggleProfileDropdown} // Toggle dropdown on click
              className={`py-2 px-4 rounded font-bold transition duration-300 no-underline ${
                activeTab === "#"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-green-100 text-blue-500"
              }`}
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              {userName}
            </Link>

            {/* Dropdown Menu */}
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
