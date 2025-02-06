import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

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
        <div className="flex items-center">
          <img src="/punjab.png" alt="Logo" className="h-[35px] w-[45px]" />
          <div className="p-1 rounded">
            <Link to="/Evaluation" className="no-underline">
              <h4 className="text-2xl font-bold uppercase">
                <span className="text-blue-500">C&W BMS- Evluation Module</span>
              </h4>
            </Link>
          </div>
        </div>

        <nav className="flex space-x-2 items-center">

          <Link
            to="/Evaluation"
            className={`py-2 px-4 rounded font-bold transition duration-300 no-underline ${
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
