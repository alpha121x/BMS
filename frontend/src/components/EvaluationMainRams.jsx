import React, { useEffect, useState } from "react";
// import BridgesList from "./BridgesList";
import BridgesListNewUpdated from "./BridgesListNewUpdated";
import { BASE_URL } from "./config";
import TopCard from "./TopCard";
import { FaClipboardCheck, FaClipboardList } from "react-icons/fa";

const EvaluationMainRams = () => {
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");
  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);
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
    fetch(`${BASE_URL}/api/inspection-counts-con`)
      .then((response) => response.json())
      .then((data) => {
        const pendingCount = data.pending || "N/A";
        const approvedCount = data.approved || "N/A";

        // Define structure for displaying cards
        const inspectedCards = [
          {
            label: "Pending Records",
            value: pendingCount,
            icon: <FaClipboardList />, // Pending icon
            color: "orange",
          },
          {
            label: "Approved Records",
            value: approvedCount,
            icon: <FaClipboardCheck />, // Approved icon
            color: "green",
          },
        ];

        setInspectedCards(inspectedCards);
      })
      .catch((error) =>
        console.error("Error fetching inspection counts:", error)
      );
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

export default EvaluationMainRams;
