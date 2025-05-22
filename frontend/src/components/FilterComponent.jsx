import { useState, useEffect } from "react";
import { BASE_URL } from "./config";

const FilterComponent = ({
  constructionType,
  setConstructionType,
  bridgeLength,
  setBridgeLength,
  age,
  setAge,
  onApplyFilters,
}) => {
  const [constructionTypes, setConstructionTypes] = useState([]);
  const [localConstructionType, setLocalConstructionType] = useState(constructionType || "%");
  const [localBridgeLength, setLocalBridgeLength] = useState(bridgeLength || "%");
  const [localAge, setLocalAge] = useState(age || "%");
  const [localSpanLength, setLocalSpanLength] = useState("%");

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const constructionTypeResponse = await fetch(
          `${BASE_URL}/api/construction-types`
        );
        const constructionTypeData = await constructionTypeResponse.json();

        setConstructionTypes(
          constructionTypeData.map((type) => ({
            id: type.id,
            name: type.construction_type || type.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  const handleChange = (setter) => (e) => {
    setter(e.target.value); // Update local state only
  };

  const handleApply = () => {
    // Update parent state with local values
    setConstructionType(localConstructionType);
    setBridgeLength(localBridgeLength);
    setAge(localAge);
    // Note: No setCategory provided in props, so removed from handleApply
    // Trigger the refetch in the parent
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  return (
    <div className="p-2  text-white rounded-lg">
      <div className="flex flex-nowrap gap-1 items-center">
        {/* Construction Type Filter */}
        <div className="flex-1 min-w-[100px]">
          <label
            htmlFor="construction-type"
            className="block text-white font-medium mb-1 text-xs"
          >
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
          <label
            htmlFor="bridge-length"
            className="block text-white font-medium mb-1 text-xs"
          >
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
          <label
            htmlFor="span-length"
            className="block text-white font-medium mb-1 text-xs"
          >
            Span Length (m)
          </label>
          <select
            id="span-length"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={localSpanLength}
            onChange={handleChange(setLocalSpanLength)}
          >
            <option value="%">All</option>
            <option value="<5">Less than 5 m</option>
            <option value="5-15">5 to 15 m</option>
            <option value="15-30">15 to 30 m</option>
            <option value=">30">Greater than 30 m</option>
          </select>
        </div>

        {/* Age Filter */}
        <div className="flex-1 min-w-[100px]">
          <label
            htmlFor="age"
            className="block text-white font-medium mb-1 text-xs"
          >
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

        {/* Apply Button with Search Icon */}
        <div className="flex items-center">
          <button
            onClick={handleApply}
            className="bg-blue-500 mt-[20px] text-white rounded-md px-2 py-1.5 text-xs hover:bg-blue-600 focus:ring-1 focus:ring-blue-500 flex items-center"
          >
          <span className="ml-1">🔍</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;