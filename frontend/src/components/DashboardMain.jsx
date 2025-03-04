import React, { useEffect, useState } from "react";
import Map from "./Map";
import BridgesListDashboard from "./BirdgesListDashboard";
import CheckingTable from "./CheckingTable";
import Graph from "./Graph";
import { FaBridge } from "react-icons/fa6";
import { FaRoadBridge } from "react-icons/fa6";
import { GiArchBridge } from "react-icons/gi";
import { SiInstructure } from "react-icons/si";
import { LuConstruction } from "react-icons/lu";
import { BASE_URL } from "./config";
import TopCardDashboard from "./TopCardDashboard";

const DashboardMain = () => {
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");

  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeView, setActiveView] = useState("map"); // 'map' or 'graph'
  const [structureCards, setStructureCards] = useState([]);
  const [inspectedCards, setInspectedCards] = useState([]);

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

  useEffect(() => {
    // Fetch data from API
    fetch(`${BASE_URL}/api/structure-counts`)
      .then((response) => response.json())
      .then((data) => {
        // Extract total structure count
        const totalCount = data.totalStructureCount || "N/A";

        // Map the response to the expected format
        const structureMap = {
          CULVERT: {
            label: "Culvert",
            icon: <LuConstruction />,
          },
          BRIDGE: {
            label: "PC Bridge",
            icon: <FaBridge />,
          },
          UNDERPASS: {
            label: "Underpass",
            icon: <FaRoadBridge />,
          },
        };

        const mappedCards = data.structureTypeCounts.map((item) => {
          const typeKey = item.structure_type.toUpperCase(); // Normalize case
          return {
            label: structureMap[typeKey]?.label || item.structure_type,
            value: item.count || "N/A",
            icon: structureMap[typeKey]?.icon || <SiInstructure />, // Fallback icon
            color: "blue",
          };
        });

        // Add total count card
        mappedCards.unshift({
          label: "Total",
          value: totalCount,
          icon: <SiInstructure />,
          color: "blue",
        });

        setStructureCards(mappedCards);
      })
      .catch((error) => console.error("Error fetching structure data:", error));
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/structure-counts-inspected`)
      .then((response) => response.json())
      .then((data) => {
        const totalCount = data.totalStructureCount || "N/A";

        // Create a structure for inspection types
        const inspectionMap = {
          CULVERT: { label: "Culvert", icon: <LuConstruction /> },
          BRIDGE: { label: "PC Bridge", icon: <FaBridge /> },
          UNDERPASS: { label: "Underpass", icon: <FaRoadBridge /> },
          // Add any other inspection types as needed
        };

        // Map the response to the expected format for inspection data
        const mappedCards = data.structureTypeCounts.map((item) => {
          const typeKey = item.structure_type.toUpperCase(); // Normalize case

          return {
            label: inspectionMap[typeKey]?.label || item.structure_type,
            value: item.count || "N/A",
            icon: inspectionMap[typeKey]?.icon || <SiInstructure />, // Default icon
            color: "blue",
          };
        });

        // Add total count card
        mappedCards.unshift({
          label: "Total",
          value: totalCount,
          icon: <SiInstructure />,
          color: "blue",
        });

        setInspectedCards(mappedCards);
      })
      .catch((error) => console.error("Error fetching structure data:", error));
  }, []);

  const evaluatedCards = [
    // Add same 3 types here also
    {
      label: "Total",
      value: "0",
      icon: <SiInstructure />,
      color: "blue",
    },
    {
      label: "Culvert",
      value: "0",
      icon: <LuConstruction />,
      color: "blue",
    },
    {
      label: "PC Bridge",
      value: "0",
      icon: <FaBridge />,
      color: "blue",
    },
    {
      label: "Underpass",
      value: "0",
      icon: <FaRoadBridge />,
      color: "blue",
    },
  ];

  return (
    <section className="bg-gray-100 min-h-screen">
      {/* Structure Section */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-gray-700">
                Total Structures Inventory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {structureCards.map((card, index) => (
                  <TopCardDashboard key={index} {...card} />
                ))}
              </div>
            </div>

            {/* Inspection Section */}
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-gray-700">
                Inspected Structures
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {inspectedCards.map((card, index) => (
                  <TopCardDashboard key={index} {...card} />
                ))}
              </div>
            </div>

            {/* Evaluation Section */}
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-gray-700">
                Evaluated Structures
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {evaluatedCards.map((card, index) => (
                  <TopCardDashboard key={index} {...card} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="flex justify-start p-1 gap-3 w-50 mt-2">
              <button
                onClick={() => setActiveView("map")}
                className={`px-8 py-2 text-lg font-semibold rounded-lg transition-all duration-300 ${
                  activeView === "map"
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setActiveView("graph")}
                className={`px-8 py-2 text-lg font-semibold rounded-lg transition-all duration-300 ${
                  activeView === "graph"
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                Graph View
              </button>
            </div>

            {/* Content Container */}
            <div>
              {activeView === "map" ? (
                <div className="mt-1">
                  <Map districtId={districtId} />
                </div>
              ) : (
                <div className="mt-1">
                  <Graph />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bridges List */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <BridgesListDashboard
               districtId={districtId}
               setDistrictId={setDistrictId}
               structureType={structureType}
               setStructureType={setStructureType}
               bridgeName={bridgeName}
               setBridgeName={setBridgeName}
            />

            <div className="mt-2">
              <CheckingTable district={districtId} bridge={bridgeName} />
            </div>
          </div>
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
