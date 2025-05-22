import { useState, useEffect } from "react";
import { BASE_URL } from "./config";

const FilterComponent = ({
  districtId,
  structureType,
  bridgeName,
  constructionType,
  setConstructionType,
  bridgeLength,
  setBridgeLength,
  category,
  setCategory,
  age,
  setAge,
  onApplyFilters,
}) => {
  const [constructionTypes, setConstructionTypes] = useState([]);

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

  const handleChange = (setter) => (e) => setter(e.target.value);

  const handleApply = () => {
    // Update parent state with current values
    setBridgeLength(bridgeLength);
    setConstructionType(constructionType);
    setCategory(category);
    setAge(age);
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
            value={constructionType}
            onChange={handleChange(setConstructionType)}
          >
            <option value="%">All</option>
            {constructionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[100px]">
          <label
            htmlFor="category-filter"
            className="block text-white font-medium mb-1 text-xs"
          >
            Category
          </label>
          <select
            id="category-filter"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={category}
            onChange={handleChange(setCategory)}
          >
            <option value="%">All</option>
            <option value="GOOD">I</option>
            <option value="FAIR">II</option>
            <option value="POOR">III</option>
            <option value="UNDER CONSTRUCTION">IV</option>
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
          <input
            id="bridge-length"
            type="number"
            className="w-full border rounded-md py-1 px-2 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-blue-500"
            value={bridgeLength}
            onChange={handleChange(setBridgeLength)}
            placeholder="Length"
          />
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
            value={age}
            onChange={handleChange(setAge)}
          >
            <option value="%">All</option>
            {/* Options to be filled later */}
          </select>
        </div>

        {/* Apply Button with Search Icon */}
        <div className="flex items-center">
          <button
            onClick={handleApply}
            className="bg-blue-100 mt-[20px]  text-white rounded-md px-2 py-1.5 text-xs hover:bg-blue-600 focus:ring-1 focus:ring-blue-500 flex items-center"
          >
            <span className="ml-1">🔍</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;