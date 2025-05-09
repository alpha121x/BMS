import React, { useEffect, useState } from "react";
// import BridgesList from "./BridgesList";
import BridgesListNewUpdated from "./BridgesListNewUpdated";
import { BASE_URL } from "./config";
import TopCard from "./TopCard";
import Map from "./MapEval";
import { FaClipboardCheck, FaClipboardList } from "react-icons/fa";
import TopCardsCon from "./TopCardsCon";
import Filters from "./Filters";
import { FaBridge } from "react-icons/fa6";
import { FaRoadBridge } from "react-icons/fa6";
import { LuConstruction } from "react-icons/lu";

const EvaluationMainCon = () => {
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");
  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [inspectedCards, setInspectedCards] = useState([]);
  const [activeView, setActiveView] = useState("map"); // 'map' or 'graph'

  const fetchInspectionCounts = async () => {
    if (!districtId) return; // Avoid unnecessary API calls

    try {
      const response = await fetch(
        `${BASE_URL}/api/inspection-counts-con?districtId=${districtId}`
      );
      const data = await response.json();

      setInspectedCards([
        {
          label: "Pending Records",
          value: data.pending || "N/A",
          icon: <FaClipboardList />,
          color: "#33B1C7",
        },
        {
          label: "Approved Records",
          value: data.approved || "N/A",
          icon: <FaClipboardCheck />,
          color: "#005D7F",
        },
      ]);
    } catch (error) {
      console.error("Error fetching inspection counts:", error);
    }
  };

  useEffect(() => {
    fetchInspectionCounts();
  }, [districtId, structureType, bridgeName]); // Re-run the effect when any of these state variables change

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

  return (
    <section className="min-h-screen">
      {/* Structure Section */}
      <div className="container-fluid mt-2">
            <div className="row g-1">
                <div className="col-md-12 d-flex gap-4  justify-content-start align-items-start">
                    <div className="d-flex gap-2">
                        <div>
                            <TopCardsCon inspectedCards={inspectedCards} />
                        </div>
                    </div>
                    <div className="bg-[#8CC5C4] p-3 rounded-1">
                        <Filters
                            districtId={districtId}
                            setDistrictId={setDistrictId}
                            structureType={structureType}
                            setStructureType={setStructureType}
                            bridgeName={bridgeName}
                            setBridgeName={setBridgeName}
                            flexDirection="flex-col"
                            padding="p-0"
                        />
                    </div>
                </div>
            </div>
        </div>

      {/* <div className="mb-2 container-fluid">
        <Map districtId={districtId} />
      </div> */}

      {/* Bridges */}
      {/* <div className="container-fluid">
        <div className="row">
          <div className="col-md-12"> */}
      {/* <BridgesListNewUpdated
              districtId={districtId}
              setDistrictId={setDistrictId}
              structureType={structureType}
              setStructureType={setStructureType}
              bridgeName={bridgeName}
              setBridgeName={setBridgeName}
            /> */}
      {/* </div>
        </div>
      </div> */}

      {/* Toggle Buttons */}
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-md-12">
            {/* Navigation Buttons */}
            <div className="flex justify-start pb-0 gap-2 w-75">
              <button
                onClick={() => setActiveView("map")}
                className={`px-12 py-2 text-lg font-semibold rounded-0 ${
                  activeView === "map"
                    ? "bg-[#005D7F] text-white"
                    : "bg-[#88B9B8] text-white hover:bg-[#005D7F]"
                }`}
              >
                Map View Analysis
              </button>
              <button
                onClick={() => setActiveView("inventory")}
                className={`px-12 py-2 text-lg font-semibold rounded-0 ${
                  activeView === "inventory"
                    ? "bg-[#005D7F] text-white"
                    : "bg-[#88B9B8] text-white hover:bg-[#005D7F]"
                }`}
              >
                Bridges List
              </button>
            </div>

            {/* Content Container */}
            <div className="mt-0">
              {activeView === "map" && <Map districtId={districtId} />}
              {activeView === "inventory" && (
                <BridgesListNewUpdated
                  districtId={districtId}
                  setDistrictId={setDistrictId}
                  structureType={structureType}
                  setStructureType={setStructureType}
                  bridgeName={bridgeName}
                  setBridgeName={setBridgeName}
                />
              )}
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

export default EvaluationMainCon;
