import React, { useEffect, useState } from "react";
import {
  UserIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import Header from "./Header";
import Footer from "./Footer";
import InventoryInfoDashboard from "./InventoryInfoDashboard";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import InspectionListDashboard from "./InspectionListDashboard";

const BridgeInfoDashboard = () => {
  const location = useLocation();
  const [bridgeData, setBridgeData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the serialized bridgeData from query parameters
    const urlParams = new URLSearchParams(location.search);
    const serializedBridgeData = urlParams.get("bridgeData");
    if (serializedBridgeData) {
      // Decode and parse the bridge data into an object
      setBridgeData(JSON.parse(decodeURIComponent(serializedBridgeData)));
    }
  }, [location]);

  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);
  // console.log("Bridge Data:", bridgeData);


  // State for managing table visibility
  const [showBridgeInspectionList, setShowBridgeInspectionList] =
    useState(false); // Default to false to show InventoryInfo first

  // Show back-to-top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackClick = () => {
    // Navigate to the previous page or a specific route
    navigate("/Dashboard"); // Adjust the route as needed
  };


  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-1">
        <Header />
      </div>

      <main className="flex-grow">
        <section className="bg-gray-100 min-h-screen">
          <div className="w-full sm:w-3/4 md:w-75 lg:w-75 mx-auto mt-2">
            {/* Bridge Information Card */}
            <div className="bg-[#60A5FA] text-grey p-3 rounded-md shadow-md flex items-center justify-between">
              <div className="flex-1">
                {/* Back Button */}
                <div className="flex justify-start">
                  <button
                    onClick={handleBackClick} // Ensure to define this function for navigation
                    className="bg-inherit hover:bg-blue-500 text-black py-2 rounded-md flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />{" "}
                    Bridges List
                  </button>
                </div>
                <div className="text-lg font-semibold">
                  Bridge Name: {bridgeData?.bridge_name}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-gray">Latest Inspection Date:</span>
                    <span className="ml-2">{bridgeData?.last_inspection_date || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray">Latest Inspection Status:</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Button Section */}
          <div className="flex justify-center mt-2">
            <div className="w-3/4 bg-blue-400 shadow-lg p-2 rounded-lg flex">
              <div className="flex-1 flex justify-center items-center">
                <div
                  onClick={() => setShowBridgeInspectionList(false)}
                  className={`${
                    !showBridgeInspectionList
                      ? "bg-blue-700 text-white"
                      : "bg-blue-300 text-black"
                  } w-full text-center p-2 cursor-pointer`}
                >
                  Inventory Information
                </div>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <div
                  onClick={() => setShowBridgeInspectionList(true)}
                  className={`${
                    showBridgeInspectionList
                      ? "bg-blue-700 text-white"
                      : "bg-blue-300 text-black"
                  } w-full text-center p-2 cursor-pointer`}
                >
                  Inspection Details List
                </div>
              </div>
            </div>
          </div>

          {/* InventoryInfo Section (Always visible) */}
          <div className="mt-2 flex justify-center">
            <div className="w-full sm:w-3/4 md:w-75 lg:w-75">
              {!showBridgeInspectionList && bridgeData && (
                <InventoryInfoDashboard inventoryData={bridgeData} />
              )}
            </div>
          </div>

          {/* Checking Listing Section */}
          {showBridgeInspectionList && (
            <div className="mt-2 flex justify-center">
              <div className="w-full sm:w-3/4 md:w-3/4 lg:w-3/4">
                <InspectionListDashboard bridgeId={bridgeData?.uu_bms_id} />
              </div>
            </div>
          )}

          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-5 right-5 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 focus:outline-none w-12 h-12 flex items-center justify-center"
            >
              ↑
            </button>
          )}
        </section>
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default BridgeInfoDashboard;
