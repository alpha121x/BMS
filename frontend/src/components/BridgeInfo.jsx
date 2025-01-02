import React, { useEffect, useState } from "react";
import { UserIcon, DocumentIcon } from "@heroicons/react/24/outline";
import BridgeListing from "./BridgeListing";
import FilterComponent from "./FilterComponent";
import CheckingTable from "./CheckingTable";
import HeaderEvaluation from "./HeaderEvaluation";
import Footer from "./Footer";

const BridgeInfo = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("%");
  const [startDate, setStartDate] = useState("");
  const [districtId, setDistrictId] = useState(null);
  const [selectedZone, setSelectedZone] = useState("%");

  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

  // State for managing table visibility
  const [showBridgesList, setShowBridgesList] = useState(false);
  const [showBridgeInspectionList, setShowBridgeInspectionList] =
    useState(false);

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

          {/* Active Button Section */}
          <div className="flex justify-center mt-2">
            <div className="w-3/4 bg-blue-400 shadow-lg p-2 rounded-lg flex">
              <div className="flex-1 flex justify-center items-center">
                <div
                  onClick={() => {
                    setShowBridgesList(true);
                    setShowBridgeInspectionList(false);
                  }}
                  className={`${
                    showBridgesList
                      ? "bg-blue-700 text-white"
                      : "bg-blue-300 text-black"
                  } w-full text-center p-2 cursor-pointer`}
                >
                  Inventory Information
                </div>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <div
                  onClick={() => {
                    setShowBridgeInspectionList(true);
                    setShowBridgesList(false);
                  }}
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

          {/* Bridge Listing Section */}
          {showBridgesList && (
            <div className="mt-2 flex justify-center">
              <div className="w-full sm:w-3/4 md:w-75 lg:w-75">
                <BridgeListing
                  selectedDistrict={selectedDistrict}
                  startDate={startDate}
                  selectedZone={selectedZone}
                />
              </div>
            </div>
          )}

          {/* Checking Listing Section */}
          {showBridgeInspectionList && (
            <div className="mt-2 flex justify-center">
              <div className="w-full sm:w-3/4 md:w-75 lg:w-75">
                <CheckingTable />
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
