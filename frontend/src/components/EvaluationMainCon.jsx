import React, { useEffect, useState } from "react";
// import BridgesList from "./BridgesList";
import BridgesListNewUpdated from "./BridgesListNewUpdated";
import { BASE_URL } from "./config";
import TopCard from "./TopCard";
import Map from "./Map";
import { FaClipboardCheck, FaClipboardList } from "react-icons/fa";

const EvaluationMainCon = () => {
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");
  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [inspectedCards, setInspectedCards] = useState([]);


  const fetchInspectionCounts = async () => {
    if (!districtId) return; // Avoid unnecessary API calls

    try {
      const response = await fetch(`${BASE_URL}/api/inspection-counts-con?districtId=${districtId}`);
      const data = await response.json();

      setInspectedCards([
        {
          label: "Pending Records",
          value: data.pending || "N/A",
          icon: <FaClipboardList />,
          color: "orange",
        },
        {
          label: "Approved Records",
          value: data.approved || "N/A",
          icon: <FaClipboardCheck />,
          color: "green",
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

      <div className="mb-2 container-fluid">
        <Map />
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

export default EvaluationMainCon;
