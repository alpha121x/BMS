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
  inspectionStatus, // New prop
  setInspectionStatus, // New prop
  onApplyFilters,
}) => {
  const [constructionTypes, setConstructionTypes] = useState([]);
  const [roadClassifications, setRoadClassifications] = useState([]);
  const [localConstructionType, setLocalConstructionType] = useState(constructionType || "%");
  const [localBridgeLength, setLocalBridgeLength] = useState(bridgeLength || "%");
  const [localAge, setLocalAge] = useState(age || "%");
  const [localSpanLength, setLocalSpanLength] = useState(spanLength || "%");
  const [localUnderFacility, setLocalUnderFacility] = useState(underFacility || "%");
  const [localRoadClassification, setLocalRoadClassification] = useState(roadClassification || "%");
  const [localInspectionStatus, setLocalInspectionStatus] = useState(inspectionStatus || "%"); // New local state

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch construction types
        const constructionTypeResponse = await fetch(`${BASE_URL}/api/construction-types`);
        const constructionTypeData = await constructionTypeResponse.json();
        setConstructionTypes(
          constructionTypeData.map((type) => ({
            id: type.id,
            name: type.construction_type || type.name,
          }))
        );

        // Fetch road classifications
        const roadClassificationResponse = await fetch(`${BASE_URL}/api/road-classifications`);
        const roadClassificationData = await roadClassificationResponse.json();
        setRoadClassifications(
          roadClassificationData.map((classification) => ({
            id: classification.id,
            name: classification.road_classification,
          }))
        );
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleApply = () => {
    // Update parent state with local values
    setConstructionType(localConstructionType);
    setBridgeLength(localBridgeLength);
    setAge(localAge);
    setUnderFacility(localUnderFacility);
    setRoadClassification(localRoadClassification);
    setSpanLength(localSpanLength);
    setInspectionStatus(localInspectionStatus); // Update inspectionStatus in parent state
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  return (
    <div className="p-2 text-white rounded-lg">
      <div className="flex flex-nowrap gap-1 items-center">
        {/* Construction Type Filter */}
        <div className="flex-1 min-w-[100px]">
          <label htmlFor="construction-type" className="block text-white font-medium mb-1 text-xs">
            Construction Type
          </label>
          <select
            id="construction-type"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={localConstructionType}
            onChange={handleChange(setLocalConstructionType)}
          >
            <option value="%">All</option>
            {constructionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bridge Length Filter */}
        <div className="flex-1 min-w-[100px]">
          <label htmlFor="bridge-length" className="block text-white font-medium mb-1 text-xs">
            Bridge Length (m)
          </label>
          <select
            id="bridge-length"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={localBridgeLength}
            onChange={handleChange(setLocalBridgeLength)}
          >
            <option value="%">All</option>
            <option value="<6">Less than 6 m</option>
            <option value="6-20">6 to 20 m</option>
            <option value="20-50">20 to 50 m</option>
            <option value=">50">Greater than 50 m</option>
          </select>
        </div>

        {/* Span Length Filter */}
        <div className="flex-1 min-w-[100px]">
          <label htmlFor="span-length" className="block text-white font-medium mb-1 text-xs">
            Span Length (m)
          </label>
          <select
            id="span-length"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={localSpanLength}
            onChange={handleChange(setLocalSpanLength)}
          >
            <option value="%">All</option>
            <option value="<6">Less than 6 m</option>
            <option value="6-10">6 to 10 m</option>
            <option value="10-15">10 to 15 m</option>
            <option value="15-20">15 to 20 m</option>
            <option value="20-35">20 to 35 m</option>
            <option value=">35">Greater than 35 m</option>
          </select>
        </div>

        {/* Age Filter */}
        <div className="flex-1 min-w-[100px]">
          <label htmlFor="age" className="block text-white font-medium mb-1 text-xs">
            Age
          </label>
          <select
            id="age"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={localAge}
            onChange={handleChange(setLocalAge)}
          >
            <option value="%">All</option>
            {/* Options to be filled later */}
          </select>
        </div>

        {/* UnderFacility Filter */}
        <div className="flex-1 min-w-[100px]">
          <label htmlFor="under_facility" className="block text-white font-medium mb-1 text-xs">
            Under Facility
          </label>
          <select
            id="under_facility"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={localUnderFacility}
            onChange={handleChange(setLocalUnderFacility)}
          >
            <option value="%">All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Road Classification Filter */}
        <div className="flex-1 min-w-[100px]">
          <label htmlFor="road-classification" className="block text-white font-medium mb-1 text-xs">
            Road Classification
          </label>
          <select
            id="road-classification"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={localRoadClassification}
            onChange={handleChange(setLocalRoadClassification)}
          >
            <option value="%">All</option>
            {roadClassifications.map((classification) => (
              <option key={classification.id} value={classification.id}>
                {classification.name}
              </option>
            ))}
          </select>
        </div>

        {/* Inspection Status Filter */}
        <div className="flex-1 min-w-[100px]">
          <label htmlFor="inspection-status" className="block text-white font-medium mb-1 text-xs">
            Inspection Status
          </label>
          <select
            id="inspection-status"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={localInspectionStatus}
            onChange={handleChange(setLocalInspectionStatus)}
          >
            <option value="%">All</option>
            <option value="inspected">Inspected</option>
            <option value="uninspected">Uninspected</option>
          </select>
        </div>

        {/* Apply Button with Search Icon */}
        <div className="flex items-center">
          <button
            onClick={handleApply}
            className="bg-blue-100 text-white mt-[20px] rounded-md px-2 py-1.5 text-xs hover:bg-blue-600 focus:ring-1 focus:ring-blue-500 flex items-center"
          >
            <span className="ml-1">🔍</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;