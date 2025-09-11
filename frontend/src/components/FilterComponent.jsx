import { useState, useEffect } from "react";
import { BASE_URL } from "./config";

const FilterComponent = ({
  constructionType,
  setConstructionType,
  bridgeLength,
  setBridgeLength,
  age,
  setAge,
  underFacility,
  setUnderFacility,
  roadClassification,
  setRoadClassification,
  spanLength,
  setSpanLength,
  inspectionStatus,
  setInspectionStatus,
  onApplyFilters,
}) => {
  const [constructionTypes, setConstructionTypes] = useState([]);
  const [roadClassifications, setRoadClassifications] = useState([]);

  // local states
  const [localConstructionType, setLocalConstructionType] = useState("%");
  const [localBridgeLength, setLocalBridgeLength] = useState("%");
  const [localAge, setLocalAge] = useState("%");
  const [localSpanLength, setLocalSpanLength] = useState("%");
  const [localUnderFacility, setLocalUnderFacility] = useState("%");
  const [localRoadClassification, setLocalRoadClassification] = useState("%");
  const [localInspectionStatus, setLocalInspectionStatus] = useState("%");

  // ✅ Load saved filters on mount
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("extraFilters") || "{}");

    setLocalConstructionType(saved.constructionType || constructionType || "%");
    setLocalBridgeLength(saved.bridgeLength || bridgeLength || "%");
    setLocalAge(saved.age || age || "%");
    setLocalSpanLength(saved.spanLength || spanLength || "%");
    setLocalUnderFacility(saved.underFacility || underFacility || "%");
    setLocalRoadClassification(saved.roadClassification || roadClassification || "%");
    setLocalInspectionStatus(saved.inspectionStatus || inspectionStatus || "%");
  }, []);

  // ✅ Save filters whenever locals change
  useEffect(() => {
    sessionStorage.setItem(
      "extraFilters",
      JSON.stringify({
        constructionType: localConstructionType,
        bridgeLength: localBridgeLength,
        age: localAge,
        spanLength: localSpanLength,
        underFacility: localUnderFacility,
        roadClassification: localRoadClassification,
        inspectionStatus: localInspectionStatus,
      })
    );
  }, [
    localConstructionType,
    localBridgeLength,
    localAge,
    localSpanLength,
    localUnderFacility,
    localRoadClassification,
    localInspectionStatus,
  ]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [ctRes, rcRes] = await Promise.all([
          fetch(`${BASE_URL}/api/construction-types`),
          fetch(`${BASE_URL}/api/road-classifications`),
        ]);
        const ctData = await ctRes.json();
        const rcData = await rcRes.json();

        setConstructionTypes(
          ctData.map((type) => ({
            id: type.id,
            name: type.construction_type || type.name,
          }))
        );
        setRoadClassifications(
          rcData.map((c) => ({
            id: c.id,
            name: c.road_classification,
          }))
        );
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };

    fetchFilters();
  }, []);

  const handleApply = () => {
    setConstructionType(localConstructionType);
    setBridgeLength(localBridgeLength);
    setAge(localAge);
    setSpanLength(localSpanLength);
    setUnderFacility(localUnderFacility);
    setRoadClassification(localRoadClassification);
    setInspectionStatus(localInspectionStatus);

    if (onApplyFilters) onApplyFilters();
  };

  return (
    <div className="p-2 text-white rounded-lg">
      <div className="flex flex-nowrap gap-1 items-center">
        {/* Construction Type */}
        <div className="flex-1 min-w-[100px]">
          <label className="block text-white font-medium mb-1 text-xs">
            Construction Type
          </label>
          <select
            value={localConstructionType}
            onChange={(e) => setLocalConstructionType(e.target.value)}
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs"
          >
            <option value="%">All</option>
            {constructionTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Bridge Length */}
        <div className="flex-1 min-w-[100px]">
          <label className="block text-white font-medium mb-1 text-xs">Bridge Length</label>
          <select
            value={localBridgeLength}
            onChange={(e) => setLocalBridgeLength(e.target.value)}
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs"
          >
            <option value="%">All</option>
            <option value="<6">Less than 6m</option>
            <option value="6-20">6 to 20m</option>
            <option value="20-50">20 to 50m</option>
            <option value=">50">Greater than 50m</option>
          </select>
        </div>

        {/* Span Length */}
        <div className="flex-1 min-w-[100px]">
          <label className="block text-white font-medium mb-1 text-xs">Span Length</label>
          <select
            value={localSpanLength}
            onChange={(e) => setLocalSpanLength(e.target.value)}
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs"
          >
            <option value="%">All</option>
            <option value="<6">Less than 6m</option>
            <option value="6-10">6 to 10m</option>
            <option value="10-15">10 to 15m</option>
            <option value="15-20">15 to 20m</option>
            <option value="20-35">20 to 35m</option>
            <option value=">35">Greater than 35m</option>
          </select>
        </div>

        {/* Age */}
        <div className="flex-1 min-w-[100px]">
          <label className="block text-white font-medium mb-1 text-xs">Age</label>
          <select
            value={localAge}
            onChange={(e) => setLocalAge(e.target.value)}
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs"
          >
            <option value="%">All</option>
            <option value="upto 5 years">Upto 5 years</option>
            <option value="6–10 years">6–10 years</option>
            <option value="11–20 years">11–20 years</option>
            <option value="21–30 years">21–30 years</option>
            <option value="30+ years">30+ years</option>
          </select>
        </div>

        {/* Under Facility */}
        <div className="flex-1 min-w-[100px]">
          <label className="block text-white font-medium mb-1 text-xs">Under Facility</label>
          <select
            value={localUnderFacility}
            onChange={(e) => setLocalUnderFacility(e.target.value)}
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs"
          >
            <option value="%">All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Road Classification */}
        <div className="flex-1 min-w-[100px]">
          <label className="block text-white font-medium mb-1 text-xs">Road Classification</label>
          <select
            value={localRoadClassification}
            onChange={(e) => setLocalRoadClassification(e.target.value)}
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs"
          >
            <option value="%">All</option>
            {roadClassifications.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Inspection Status */}
        <div className="flex-1 min-w-[100px]">
          <label className="block text-white font-medium mb-1 text-xs">Inspection Status</label>
          <select
            value={localInspectionStatus}
            onChange={(e) => setLocalInspectionStatus(e.target.value)}
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs"
          >
            <option value="%">All</option>
            <option value="inspected">Inspected</option>
            <option value="uninspected">Uninspected</option>
          </select>
        </div>

        {/* Apply Button */}
        <div className="flex items-center">
          <button
            onClick={handleApply}
            className="bg-blue-500 text-white mt-[20px] rounded-md px-3 py-1.5 text-xs hover:bg-blue-600"
          >
            🔍
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
