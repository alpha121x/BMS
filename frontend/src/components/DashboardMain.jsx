import React, { useEffect, useState } from "react";
import {
  UserIcon,
  HomeIcon,
  DocumentTextIcon,
  WrenchIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import FilterComponent from "./FilterComponent";
import Map from "./Map";
import BridgesListDashboard from "./BirdgesListDashboard";

const DashboardMain = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("%");
  const [minBridgeLength, setMinBridgeLength] = useState("");
  const [maxBridgeLength, setMaxBridgeLength] = useState("");
  const [minSpanLength, setMinSpanLength] = useState("");
  const [maxSpanLength, setMaxSpanLength] = useState("");
  const [structureType, setStructureType] = useState("");
  const [constructionType, setConstructionType] = useState("");
  const [category, setCategory] = useState("");
  const [noOfSpan, setNoOfSpan] = useState("");
  const [evaluationStatus, setEvaluationStatus] = useState("");
  const [inspectionStatus, setInspectionStatus] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");

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

  // Data for Structure cards
  const structureCards = [
    {
      label: "Total",
      value: "42,830",
      icon: <UserIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Culvert",
      value: "37,307",
      icon: <WrenchIcon className="w-10 h-10 text-blue-500" />, // Wrench for construction/maintenance
      color: "blue",
    },
    {
      label: "PC Bridge",
      value: "5,515",
      icon: <BuildingOfficeIcon className="w-10 h-10 text-blue-500" />, // Building Office Icon, representing large structures like bridges
      color: "blue",
    },
    {
      label: "Arch",
      value: "27",
      icon: <DocumentTextIcon className="w-10 h-10 text-blue-500" />, // Document icon to represent an architectural design
      color: "blue",
    },
    {
      label: "Underpass",
      value: "8",
      icon: <HomeIcon className="w-10 h-10 text-blue-500" />, // Home icon representing an underpass construction type
      color: "blue",
    },
  ];

  // Data for Evaluation cards
  const inspectedCards = [
    {
      label: "Total",
      value: "1,511",
      icon: <UserIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Culvert",
      value: "1,102",
      icon: <WrenchIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "PC Bridge",
      value: "347",
      icon: <BuildingOfficeIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Arch",
      value: "4",
      icon: <DocumentTextIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Underpass",
      value: "1",
      icon: <HomeIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
  ];

  // Card Component with dynamic border color
  const Card = ({ label, value, icon, iconSize = 32 }) => (
    <div 
      className="rounded-lg shadow-lg text-white transition-all duration-300 hover:shadow-xl p-2 flex justify-between items-center"
      style={{ 
        background: 'linear-gradient(135deg, rgba(59, 100, 246, 0.8), rgba(96, 165, 250, 0.8))', // Light blue gradient
        border: `2px solid #3B82F6`, // Blue border for contrast
        borderRadius: '9px' // Rounded corners
      }}
    >
      <div className="flex items-center flex-grow text-white">
        <div 
          className="p-2 rounded-full mr-3 flex items-center justify-center"
          style={{
            backgroundColor: 'rgb(123, 179, 247)', // Slightly lighter background for the icon
            width: `${iconSize + 16}px`,
            height: `${iconSize + 16}px`,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' // Add shadow for depth
          }}
        >
          {React.cloneElement(icon, { size: iconSize, color: '#fff' })} {/* White icon color */}
        </div>
        <h3 className="text-xl font-semibold flex-grow text-white">
          {label}
        </h3>
      </div>
      
  
      <div className="text-3xl font-bold ml-2 text-white">
        {value}
      </div>
    </div>
  );
  

  return (
    <section className="bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-500 mb-1">Summary</h2>

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
            setMinBridgeLength={setMinBridgeLength}
            setMaxBridgeLength={setMaxBridgeLength}
            setMinSpanLength={setMinSpanLength}
            setMaxSpanLength={setMaxSpanLength}
            setStructureType={setStructureType}
            setConstructionType={setConstructionType}
            setCategory={setCategory}
            setNoOfSpan={setNoOfSpan}
            setEvaluationStatus={setEvaluationStatus}
            setInspectionStatus={setInspectionStatus}
            setMinYear={setMinYear}
            setMaxYear={setMaxYear}
          />
        </div>
      </div>

      {/* Structure Section */}
      <div className="mb-2">
        <h3 className="text-xl font-semibold text-gray-700">Structures</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {structureCards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </div>
      </div>

      {/* Evaluation Section */}
      <div className="mb-2">
        <h3 className="text-xl font-semibold text-gray-700">Inspected</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {inspectedCards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="">
        <Map />
      </div>

      {/* Bridges List */}
      <div className="mt-2 flex justify-center">
        <div className="w-full sm:w-3/4 md:w-75 lg:w-75">
          <BridgesListDashboard />
        </div>
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
