import React, { useEffect, useState } from "react";
import { FaBridge } from "react-icons/fa6";
import { FaRoadBridge } from "react-icons/fa6";
import { SiInstructure } from "react-icons/si";
import { LuConstruction } from "react-icons/lu";
import BridgesListNewUpdated from "./BridgesListNewUpdated";
import { BASE_URL } from "./config";
import TopCardDashboard from "./TopCardDashboard"; // Import TopCardDashboard
import Filters from "./Filters"; // Import Filters component

const EvaluationMain = () => {
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [inspectedCards, setInspectedCards] = useState([]);
  const [evaluatedCards, setEvaluatedCards] = useState([]);

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
    fetch(`${BASE_URL}/api/structure-counts-inspected-eval?district=${districtId}`)
      .then((response) => response.json())
      .then((data) => {
        const totalCount = data.totalStructureCount || "0";

        const inspectionMap = {
          CULVERT: { label: "Culvert", icon: <LuConstruction /> },
          BRIDGE: { label: "PC Bridge", icon: <FaBridge /> },
          UNDERPASS: { label: "Underpass", icon: <FaRoadBridge /> },
        };

        const mappedCards = data.structureTypeCounts.map((item) => {
          const typeKey = item.structure_type.toUpperCase();
          return {
            label: inspectionMap[typeKey]?.label || item.structure_type,
            value: item.count || "0",
            icon: inspectionMap[typeKey]?.icon || <SiInstructure />,
            color: "#3B9996",
          };
        });

        mappedCards.unshift({
          label: "Inspected Structures",
          value: totalCount,
          icon: <SiInstructure />,
          color: "#3B9996",
        });

        setInspectedCards(mappedCards);
      })
      .catch((error) => console.error("Error fetching structure data:", error));
  }, [districtId]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/structure-counts-evaluated?district=${districtId}`)
      .then((response) => response.json())
      .then((data) => {
        const totalCount = data.totalStructureCount || "0";

        const evaluatedMap = {
          CULVERT: { label: "Culvert", icon: <LuConstruction /> },
          BRIDGE: { label: "PC Bridge", icon: <FaBridge /> },
          UNDERPASS: { label: "Underpass", icon: <FaRoadBridge /> },
        };

        const mappedCards = data.structureTypeCounts.map((item) => {
          const typeKey = item.structure_type.toUpperCase();
          return {
            label: evaluatedMap[typeKey]?.label || item.structure_type,
            value: item.count || "0",
            icon: evaluatedMap[typeKey]?.icon || <SiInstructure />,
            color: "#3B9996",
          };
        });

        mappedCards.unshift({
          label: "Evaluated Structures",
          value: totalCount,
          icon: <SiInstructure />,
          color: "#3B9996",
        });

        setEvaluatedCards(mappedCards);
      })
      .catch((error) => console.error("Error fetching structure data:", error));
  }, [districtId]);

  return (
    <section className="bg-gray-100 min-h-screen">
      {/* Evaluation Section */}
      <div className="container-fluid mt-[65px]">
        <div className="row g-2">
          <div className="col-md-10">
            <div className="row g-2">
              <div className="col-md-4">
                <div className="mb-2">
                  {/* Only One Card Displaying Total and Three Counts */}
                  <TopCardDashboard
                    totalLabel="Inspected Structures"
                    totalValue={inspectedCards[0]?.value} // Assuming first item contains the total
                    color="#009DB9"
                    items={[
                      {
                        label: "Culvert",
                        value: inspectedCards[2]?.value,
                        icon: <LuConstruction />,
                      },
                      {
                        label: "PC Bridge",
                        value: inspectedCards[1]?.value,
                        icon: <FaBridge />,
                      },
                      {
                        label: "Underpass",
                        value: inspectedCards[3]?.value,
                        icon: <FaRoadBridge />,
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-2">
                  {/* Only One Card Displaying Total and Three Counts */}
                  <TopCardDashboard
                    totalLabel="Evaluated Structures"
                    totalValue={evaluatedCards[0]?.value} // Assuming first item contains the total
                    color="#3B9996"
                    items={[
                      {
                        label: "Culvert",
                        value: evaluatedCards[2]?.value,
                        icon: <LuConstruction />,
                      },
                      {
                        label: "PC Bridge",
                        value: evaluatedCards[1]?.value,
                        icon: <FaBridge />,
                      },
                      {
                        label: "Underpass",
                        value: evaluatedCards[3]?.value,
                        icon: <FaRoadBridge />,
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="col-md-2 bg-[#8CC5C4] p-2 rounded-1">
                <Filters
                  districtId={districtId}
                  setDistrictId={setDistrictId}
                  structureType={structureType}
                  setStructureType={setStructureType}
                  bridgeName={bridgeName}
                  setBridgeName={setBridgeName}
                  // fetchAllBridges={fetchAllBridges} // Search triggered manually
                  flexDirection="flex-col"
                  padding="p-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bridges */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <BridgesListNewUpdated
              districtId={districtId}
              setDistrictId={setDistrictId}
              structureType={structureType}
              setStructureType={setStructureType}
              bridgeName={bridgeName}
              setBridgeName={setBridgeName}
            />
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

export default EvaluationMain;
