import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FaCircleUser } from "react-icons/fa6";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname;
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const reportsRef = useRef(null);
  const setupRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("isEvaluationAuthenticated", "false");
    navigate("/LoginEvaluation");
  };

  const userToken = JSON.parse(localStorage.getItem("userEvaluation"));
  const userName = userToken?.username;


  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
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
        <dsssssiv className="flex items-center">
          <img src="/cnw.jpg" alt="Logo" className="h-[26px]" />
          <div className="mt-1 ms-2">
            <Link to="/Evaluation" className="no-underline">
              <h5 className="font-bold uppercase">
                <span className="text-blue-500">C&W BMS- Evluation Module</span>
              </h5>
            </Link>
          </div>
        </dsssssiv>

        <nav className="flex space-x-2 items-center">

          <Link
            to="/Evaluation"
            className={`py-1 px-3 rounded-1 font-semibold transition duration-300 no-underline ${
              activeTab === "/Evaluation"
                ? "bg-blue-500 text-white"
                : "hover:bg-green-100 text-blue-500"
            }`}
          >
            Evaluation Module
          </Link>

          {/* Profile Dropdown */}
          <div className="relative inline-block text-left" ref={profileRef}>
            <Link
              to="#"
              onClick={toggleProfileDropdown}
              className={`p-1 ms-2 font-semibold transition duration-300 no-underline ${
                activeTab === "#"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100 text-blue-500"
              }`}
            >
              <FontAwesomeIcon icon={faUserCircle} className="mr-2 fs-3"  />
              
            </Link>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 w-fit bg-white border border-gray-200 rounded-1 shadow-lg transition-all duration-200 ease-in-out transform scale-95">
                <Link
                  className="flex items-center px-4 py-2 hover:bg-gray-100 no-underline transition duration-200"
                >
                  <span className="text-capitalize">{userName}</span>
                </Link>
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="flex items-center px-4 py-2 hover:bg-red-100 no-underline transition duration-200"
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
