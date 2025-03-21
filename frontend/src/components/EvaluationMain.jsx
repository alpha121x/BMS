import React, { useEffect, useState } from "react";
import { FaBridge } from "react-icons/fa6";
import { FaRoadBridge } from "react-icons/fa6";
import { SiInstructure } from "react-icons/si";
import { LuConstruction } from "react-icons/lu";
// import BridgesList from "./BridgesList";
import BridgesListNewUpdated from "./BridgesListNewUpdated";
import { BASE_URL } from "./config";
import TopCard from "./TopCard";

const EvaluationMain = () => {
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");
  // State for back-to-top button visibility
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
        const mappedCards = data.structureTypeCounts.map((item) => ({
          label:
            inspectionMap[item.structure_type]?.label || item.structure_type,
          value: item.count || "N/A",
          icon: inspectionMap[item.structure_type]?.icon || <SiInstructure />, // Default icon
          color: "blue",
        }));

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

   useEffect(() => {
      fetch(`${BASE_URL}/api/structure-counts-evaluated`)
        .then((response) => response.json())
        .then((data) => {
          const totalCount = data.totalStructureCount || "N/A";
  
          // Create a structure for inspection types
          const evaluatedMap = {
            CULVERT: { label: "Culvert", icon: <LuConstruction /> },
            BRIDGE: { label: "PC Bridge", icon: <FaBridge /> },
            UNDERPASS: { label: "Underpass", icon: <FaRoadBridge /> },
            // Add any other inspection types as needed
          };
  
          // Map the response to the expected format for inspection data
          const mappedCards = data.structureTypeCounts.map((item) => {
            const typeKey = item.structure_type.toUpperCase(); // Normalize case
  
            return {
              label: evaluatedMap[typeKey]?.label || item.structure_type,
              value: item.count || "N/A",
              icon: evaluatedMap[typeKey]?.icon || <SiInstructure />, // Default icon
              color: "#3B9996",
            };
          });
  
          // Add total count card
          mappedCards.unshift({
            label: "Total Inspected Strcutures",
            value: totalCount,
            icon: <SiInstructure />,
            color: "#3B9996",
          });
  
          setEvaluatedCards(mappedCards);
        })
        .catch((error) => console.error("Error fetching structure data:", error));
    }, []);
  

  return (
    <section className="bg-gray-100 min-h-screen">
      {/* Evaluation Section */}
      <div className="mb-2">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h5 className="font-semibold text-gray-700">
                Inspected Structures
              </h5>
            </div>
          </div>
          <div className="row gx-2">
            {inspectedCards.map((card, index) => (
              <TopCard key={index} {...card} />
            ))}
          </div>
          <div className="row">
            <div className="col-md-12">
              <h5 className="font-semibold text-gray-700">
                Evaluated Structures
              </h5>
            </div>
          </div>
          <div className="row gx-2">
            {evaluatedCards.map((card, index) => (
              <TopCard key={index} {...card} />
            ))}
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
