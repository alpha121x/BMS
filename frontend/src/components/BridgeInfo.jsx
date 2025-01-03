import React, { useEffect, useState } from "react";
import { UserIcon, DocumentIcon, TrashIcon  } from "@heroicons/react/24/outline";
import FilterComponent from "./FilterComponent";
import HeaderEvaluation from "./HeaderEvaluation";
import Footer from "./Footer";
import InventoryInfo from "./InventoryInfo";
import { useLocation } from "react-router-dom";
import InspectionList from "./InspectionList";

const BridgeInfo = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("%");
  const [startDate, setStartDate] = useState("");
  const [districtId, setDistrictId] = useState(null);
  const [selectedZone, setSelectedZone] = useState("%");
  const location = useLocation();
  const [bridgeData, setBridgeData] = useState(null);

  useEffect(() => {
    // Retrieve the serialized bridgeData from query parameters
    const urlParams = new URLSearchParams(location.search);
    const serializedBridgeData = urlParams.get("bridgeData");

    if (serializedBridgeData) {
      // Decode and parse the bridge data into an object
      setBridgeData(JSON.parse(decodeURIComponent(serializedBridgeData)));
      // console.log("Bridge Data:", bridgeData);
    }
  }, [location]);

  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  // Data for cards
  const cardData = [
    {
      label: "Total Structures",
      value: "18,805",
      icon: <UserIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Bridges",
      value: "1,433",
      icon: <DocumentIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Culvert",
      value: "17,302",
      icon: <DocumentIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Underpass",
      value: "14",
      icon: <DocumentIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
  ];

  const inspectionData = [
    {
      label: "Bridges Inspected",
      value: "1,511",
      icon: <DocumentIcon className="w-10 h-10 text-green-500" />,
      color: "green",
    },
    {
      label: "Total Inspections",
      value: "23,578",
      icon: <DocumentIcon className="w-10 h-10 text-green-500" />,
      color: "green",
    },
  ];

  const allCards = [...cardData, ...inspectionData];

  // Helper to assign border classes based on card color
  const getBorderClass = (color) => {
    switch (color) {
      case "blue":
        return "border-blue-400 text-blue-500";
      case "green":
        return "border-green-400 text-green-500";
      default:
        return "border-gray-400 text-gray-500";
    }
  };

  // Card Component
  const Card = ({ label, value, icon, color }) => (
    <div
      className={`border-2 ${getBorderClass(
        color
      )} bg-white py-1 px-1 rounded-lg shadow-lg flex items-center gap-4`}
    >
      <div>{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-gray-700">{label}</h4>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-1">
        <HeaderEvaluation />
      </div>

      <main className="flex-grow p-1">
        <section className="bg-gray-100 min-h-screen">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-semibold text-gray-500 mb-1">
              Evaluation Module
            </h2>

            <button
              className="btn btn-primary flex items-center gap-2"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasRight"
              aria-controls="offcanvasRight"
            >
              {/* Filter Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-5.414 5.414A2 2 0 0014 13.414V20a1 1 0 01-1.447.894l-4-2A1 1 0 018 17.618v-4.204a2 2 0 00-.586-1.414L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
            </button>
          </div>

          {/* Offcanvas Sidebar for Filters */}
          <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="offcanvasRight"
            aria-labelledby="offcanvasRightLabel"
          >
            <div className="offcanvas-header">
              <h5 id="offcanvasRightLabel" className="text-xl font-bold">
                Filters
              </h5>
              <button
                type="button"
                className="btn-close text-reset"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>

            <div className="offcanvas-body">
              <FilterComponent
                setSelectedDistrict={setSelectedDistrict}
                setStartDate={setStartDate}
                districtId={districtId}
                setDistrictId={setDistrictId}
                setSelectedZone={setSelectedZone}
              />
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-12 gap-2">
            {allCards.map((card, index) => (
              <div
                key={index}
                className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2"
              >
                <Card
                  label={card.label}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                />
              </div>
            ))}
          </div>

          <div className="w-full sm:w-3/4 md:w-75 lg:w-75 mx-auto mt-2">
            <div className="bg-[#4C8C2B] text-white p-4 rounded-md shadow-md flex items-center justify-between">
              <div className="flex-1">
                <div className="text-lg font-semibold">
                  {bridgeData?.BridgeName || "Bridge Name"}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-gray-200">
                      Latest inspection Date:
                    </span>
                    <span className="ml-2">{"N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-200">
                      Latest inspection Status:
                    </span>
                    <span className="ml-2 bg-white text-red-500 px-2 py-1 rounded-md text-sm">
                      {bridgeData?.ApprovedFlag || "UnApproved"}
                    </span>
                  </div>
                </div>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <TrashIcon className="h-5 w-5" />
                Delete
              </button>
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
                <InventoryInfo inventoryData={bridgeData} />
              )}
            </div>
          </div>

          {/* Checking Listing Section */}
          {showBridgeInspectionList && (
            <div className="mt-2 flex justify-center">
              <div className="w-full sm:w-3/4 md:w-3/4 lg:w-3/4">
                <InspectionList bridgeId={bridgeData?.ObjectID} />
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

export default BridgeInfo;
