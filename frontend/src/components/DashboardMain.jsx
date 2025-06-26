import { useEffect, useState } from "react";
import BridgesListDashboard from "./BridgesListDashboard";
import { FaBridge } from "react-icons/fa6";
import { FaRoadBridge } from "react-icons/fa6";
import { GiArchBridge } from "react-icons/gi";
import { SiInstructure } from "react-icons/si";
import { LuConstruction } from "react-icons/lu";
import { BASE_URL } from "./config";
import TopCardDashboard from "./TopCardDashboard";
import Filters from "./Filters";
import PriotizationTable from "./PriotizationTable"; // Import the new component
import CostEstimation from "./CostEstimation"; // Import the new component
import BridgeStatusSummaryDashboard from "./BridgeStatusSummaryDashboard"; // Import the new component

const DashboardMain = () => {
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [constructionType, setConstructionType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");
  const [bridgeLength, setBridgeLength] = useState("");
  const [age, setAge] = useState("");
  const [underFacility, setUnderFacility] = useState("%"); // New filter state
  const [roadClassification, setRoadClassification] = useState("%"); // New filter state
  const [spanLength, setSpanLength] = useState("%");
  const bridges_status_summary = "bridge-status-summary-combined";



  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeView, setActiveView] = useState("inventory"); // 'map' or 'graph'
  const [structureCards, setStructureCards] = useState([]);
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
    fetch(`${BASE_URL}/api/structure-counts?district=${districtId}`)
      .then((response) => response.json())
      .then((data) => {
        const totalCount = data.totalStructureCount || "0";

        const structureMap = {
          CULVERT: { label: "Culvert", icon: <LuConstruction /> },
          BRIDGE: { label: "Bridge", icon: <FaBridge /> },
          UNDERPASS: { label: "Underpass", icon: <FaRoadBridge /> },
        };

        const mappedCards = data.structureTypeCounts.map((item) => {
          const typeKey = item.structure_type.toUpperCase();
          return {
            label: structureMap[typeKey]?.label || item.structure_type,
            value: item.count || "0",
            icon: structureMap[typeKey]?.icon || <SiInstructure />,
            color: "#005D7F",
          };
        });

        mappedCards.unshift({
          label: "Total Structures Inventory",
          value: totalCount,
          icon: <SiInstructure />,
          color: "#005D7F",
        });

        setStructureCards(mappedCards);
      })
      .catch((error) => console.error("Error fetching structure data:", error));
  }, [districtId]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/structure-counts-inspected?district=${districtId}`)
      .then((response) => response.json())
      .then((data) => {
        const totalCount = data.totalStructureCount || "0";

        const inspectionMap = {
          CULVERT: { label: "Culvert", icon: <LuConstruction /> },
          BRIDGE: { label: "Bridge", icon: <FaBridge /> },
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
          label: "Total Inspected Structures",
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
          BRIDGE: { label: "Bridge", icon: <FaBridge /> },
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
          label: "Total Evaluated Structures",
          value: totalCount,
          icon: <SiInstructure />,
          color: "#3B9996",
        });

        setEvaluatedCards(mappedCards);
      })
      .catch((error) => console.error("Error fetching structure data:", error));
  }, [districtId]);

  const constructionCards = [
    // Add same 3 types here also
    {
      label: "Deck Slab Bridges",
      value: "0",
      icon: <FaBridge />,
      color: "#009DB9",
    },
    {
      label: "Girder Bridges",
      value: "0",
      icon: <FaBridge />,
      color: "#009DB9",
    },
    {
      label: "Arch & Others",
      value: "0",
      icon: <GiArchBridge />,
      color: "#009DB9",
    },
    {
      label: "Culverts (Box & Pipes)",
      value: "0",
      icon: <LuConstruction />,
      color: "#009DB9",
    },
  ];

  return (
    <section className="min-h-screen">
      {/* Structure Section */}
      <div className="container-fluid mt-[65px]">
        <div className="row g-2">
          <div className="col-md-10">
            <div className="row g-2">
              <div className="col-md-4">
                <div className="mb-2">
                  {/* Only One Card Displaying Total and Three Counts */}
                  <TopCardDashboard
                    totalLabel="Inventory Structures"
                    totalValue={structureCards[0]?.value} // Assuming first item contains the total
                    color="#005D7F"
                    items={[
                      {
                        label: "Culvert",
                        value: structureCards[1]?.value,
                        icon: <LuConstruction />,
                      },
                      {
                        label: "Bridge",
                        value: structureCards[2]?.value,
                        icon: <FaBridge />,
                      },
                      {
                        label: "Underpass",
                        value: structureCards[3]?.value,
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
                        label: "Bridge",
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
                        label: "Bridge",
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

      {/* Toggle Buttons */}
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-md-12">
            {/* Navigation Buttons */}
            <div className="flex justify-start pb-0 gap-2 w-75">
              <button
                onClick={() => setActiveView("inventory")}
                className={`px-12 py-2 text-lg font-semibold rounded-0 ${
                  activeView === "inventory"
                    ? "bg-[#005D7F] text-white"
                    : "bg-[#88B9B8] text-white hover:bg-[#005D7F]"
                }`}
              >
                Inventory
              </button>
               <button
                onClick={() => setActiveView("bridge_summary")}
                className={`px-12 py-2 text-lg font-semibold rounded-0 ${
                  activeView === "bridge_summary"
                    ? "bg-[#005D7F] text-white"
                    : "bg-[#88B9B8] text-white hover:bg-[#005D7F]"
                }`}
              >
                Bridge Status Summary
              </button>
                   <button
                onClick={() => setActiveView("priortization")}
                className={`px-12 py-2 text-lg font-semibold rounded-0 ${
                  activeView === "priortization"
                    ? "bg-[#005D7F] text-white"
                    : "bg-[#88B9B8] text-white hover:bg-[#005D7F]"
                }`}
              >
                Priortization
              </button>
                   <button
                onClick={() => setActiveView("cost")}
                className={`px-12 py-2 text-lg font-semibold rounded-0 ${
                  activeView === "cost"
                    ? "bg-[#005D7F] text-white"
                    : "bg-[#88B9B8] text-white hover:bg-[#005D7F]"
                }`}
              >
                Cost
              </button>
            </div>

            {/* Content Container */}
            <div className="mt-0">
              {activeView === "inventory" && (
                <BridgesListDashboard
                  districtId={districtId}
                  setDistrictId={setDistrictId}
                  structureType={structureType}
                  setStructureType={setStructureType}
                  constructionType={constructionType}
                  setConstructionType={setConstructionType}
                  bridgeName={bridgeName}
                  setBridgeName={setBridgeName}
                  bridgeLength={bridgeLength}
                  setBridgeLength={setBridgeLength}
                  age={age}
                  setAge={setAge}
                  underFacility={underFacility}
                  setUnderFacility={setUnderFacility}
                  roadClassification={roadClassification}
                  setRoadClassification={setRoadClassification}
                  spanLength={spanLength}
                  setSpanLength={setSpanLength}
                />
              )}
              {
                activeView === "priortization" && (
                  <PriotizationTable
                  districtId={districtId}
                  />
                )}
                {
                activeView === "cost" && (
                  <CostEstimation />
                )}
                { activeView === "bridge_summary" && (
                  <BridgeStatusSummaryDashboard
                  api_endpoint={bridges_status_summary}
                   districtId={districtId}
                  structureType={structureType}
                  bridgeName={bridgeName}
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

export default DashboardMain;
