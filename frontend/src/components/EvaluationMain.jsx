import React, { useEffect, useState } from "react";
import { FaBridge } from "react-icons/fa6";
import { FaRoadBridge } from "react-icons/fa6";
import { GiArchBridge } from "react-icons/gi";
import { SiInstructure } from "react-icons/si";
import { LuConstruction } from "react-icons/lu";
import BridgesList from "./BridgesList";

const EvaluationMain = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("%");
  const [minBridgeLength, setMinBridgeLength] = useState("");
  const [maxBridgeLength, setMaxBridgeLength] = useState("");
  const [minSpanLength, setMinSpanLength] = useState("");
  const [maxSpanLength, setMaxSpanLength] = useState("");
  const [structureType, setStructureType] = useState("");
  const [constructionType, setConstructionType] = useState("");
  const [category, setCategory] = useState("");
  const [evaluationStatus, setEvaluationStatus] = useState("");
  const [inspectionStatus, setInspectionStatus] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [bridge, setBridgeName] = useState("");
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

  // Data for Evaluation cards
  const inspectedCards = [
    {
      label: "Total",
      value: "1,526",
      icon: <SiInstructure />,
      color: "blue",
    },
    {
      label: "Culvert",
      value: "774",
      icon: <LuConstruction />,
      color: "blue",
    },
    {
      label: "PC Bridge",
      value: "751",
      icon: <FaBridge />,
      color: "blue",
    },
    // {
    //   label: "Arch",
    //   value: "4",
    //   icon: <GiArchBridge />,
    //   color: "blue",
    // },
    {
      label: "Underpass",
      value: "1",
      icon: <FaRoadBridge />,
      color: "blue",
    },
  ];

  // Card Component with dynamic border color
  const Card = ({ label, value, icon, iconSize = 32 }) => (
    <div
      className="rounded-lg shadow-lg text-white transition-all duration-300 hover:shadow-xl p-2 flex justify-between items-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(59, 100, 246, 0.8), rgba(96, 165, 250, 1))", // Light blue gradient
        border: `2px solid #3B82F6`, // Blue border for contrast
        borderRadius: "9px", // Rounded corners
      }}
    >
      <div className="flex items-center flex-grow text-white">
        <div
          className="p-2 rounded-full mr-3 flex items-center justify-center"
          style={{
            backgroundColor: "rgb(123, 179, 247)", // Slightly lighter background for the icon
            width: `${iconSize + 16}px`,
            height: `${iconSize + 16}px`,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add shadow for depth
          }}
        >
          {React.cloneElement(icon, { size: iconSize, color: "#fff" })}{" "}
          {/* White icon color */}
        </div>
        <h3 className="text-xl font-semibold flex-grow text-white">{label}</h3>
      </div>

      <div className="text-3xl font-bold ml-2 text-white">{value}</div>
    </div>
  );

  return (
    <section className="bg-gray-100 min-h-screen">
      {/* Evaluation Section */}
      <div className="mb-2">
        <h3 className="text-xl font-semibold text-gray-700">
          Inspected Structures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {inspectedCards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </div>
      </div>

      {/* Bridges */}
      <div className="mt-2 flex justify-center">
        <div className="w-full p-4">
          <BridgesList
            setSelectedDistrict={setSelectedDistrict}
            setMinBridgeLength={setMinBridgeLength}
            setMaxBridgeLength={setMaxBridgeLength}
            setMinSpanLength={setMinSpanLength}
            setMaxSpanLength={setMaxSpanLength}
            setStructureType={setStructureType}
            setConstructionType={setConstructionType}
            setCategory={setCategory}
            setEvaluationStatus={setEvaluationStatus}
            setInspectionStatus={setInspectionStatus}
            setMinYear={setMinYear}
            setMaxYear={setMaxYear}
            setBridge={setBridgeName}
            district={selectedDistrict}
            structureType={structureType}
            constructionType={constructionType}
            category={category}
            evaluationStatus={evaluationStatus}
            inspectionStatus={inspectionStatus}
            minBridgeLength={minBridgeLength}
            maxBridgeLength={maxBridgeLength}
            minSpanLength={minSpanLength}
            maxSpanLength={maxSpanLength}
            minYear={minYear}
            maxYear={maxYear}
            bridge={bridge} // Also pass the current bridge id filter
          />
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
