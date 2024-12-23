import React, {useEffect, useState } from "react";
import { UserIcon, DocumentIcon } from "@heroicons/react/24/outline";
import BridgeListing from "./BridgeListing";
import FilterComponent from "./FilterComponent";
import Map from "./Map";
import GraphComponent from "./GraphComponent";
import CheckingTable from "./CheckingTable";

const DashboardMain = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("%");
  const [startDate, setStartDate] = useState(""); 
  const [districtId, setDistrictId] = useState(null);
  const [selectedZone, setSelectedZone] = useState("%");

  const [infrastructureData, setInfrastructureData] = useState([
    14, 1433, 17302,
  ]);

  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

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
      label: "Bridges Checked",
      value: "1,511",
      icon: <DocumentIcon className="w-10 h-10 text-green-500" />,
      color: "green",
    },
    {
      label: "Total Checkings",
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
    <section className="bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-gray-500 mb-1">
          Dashboard Overview
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

      {/* Map and Pie Chart Layout */}
      <div className="grid grid-cols-12 gap-2 mt-6">
        {/* Map Card (70% width on large screens, full width on smaller screens) */}
        <div className="col-span-12 lg:col-span-8" style={{ height: "380px" }}>
          <div
            className="card p-2 rounded-lg text-black"
            style={{
              background: "#FFFFFF",
              border: "2px solid #60A5FA",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              position: "relative",
            }}
          >
            <div className="card-body pb-0">
              <h2 className="text-xl font-semibold mb-4">Map</h2>
              <Map
              selectedDistrict={selectedDistrict}
              selectedZone={selectedZone}
              />
            </div>
          </div>
        </div>

        {/* Pie Chart Card (30% width on large screens, full width on smaller screens) */}
        <div className="col-span-12 lg:col-span-4">
          <div
            className="card p-2 rounded-lg text-black"
            style={{
              background: "#FFFFFF",
              border: "2px solid #60A5FA",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              position: "relative",
            }}
          >
            <div className="card-body pb-0">
              <h2 className="text-xl font-semibold mb-4">
                Infrastructure Pie Chart
              </h2>
              <GraphComponent data={infrastructureData} />
            </div>
          </div>
        </div>
      </div>

      {/* Bridge Listing Section */}
      <div className="mt-2">
        <BridgeListing
          selectedDistrict={selectedDistrict}
          startDate={startDate}
          selectedZone={selectedZone}
        />
      </div>

      {/* Checking Listing Section */}
      <div className="mt-2">
        <CheckingTable />
      </div>

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
  );
};

export default DashboardMain;
