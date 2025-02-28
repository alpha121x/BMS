import React, { useState, useEffect } from "react";
import { BASE_URL } from "./config";
import { FaSearch } from "react-icons/fa";

const Filters = ({ fetchAllBridges }) => {
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");
  const [districts, setDistricts] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);

  // Fetch filters on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetching districts
        const districtResponse = await fetch(`${BASE_URL}/api/districts`);
        const districtData = await districtResponse.json();
        setDistricts(
          districtData.map((district) => ({
            id: district.id,
            district: district.district || district.name,
          }))
        );

        // Fetching structure types
        const structureTypeResponse = await fetch(
          `${BASE_URL}/api/structure-types`
        );
        const structureTypesData = await structureTypeResponse.json();
        setStructureTypes(
          structureTypesData.map((type) => ({
            id: type.id,
            name: type.structure_type || type.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  // When search button is clicked, trigger fetchAllBridges manually
  const handleSearch = () => {
    fetchAllBridges(1, 10, districtId, structureType, bridgeName);
  };

  return (
    <div className="flex items-center gap-2 justify-between">
      {/* District Filter */}
      <div>
        <select
          id="district-filter"
          className="w-full border border-[#3B82F6] rounded p-1 bg-gray-200"
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
        >
          <option value="%">--Select District--</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.district}
            </option>
          ))}
        </select>
      </div>

      {/* Structure Type Filter */}
      <div>
        <select
          id="structure-type"
          className="w-full border border-[#3B82F6] rounded p-1 bg-gray-200"
          value={structureType}
          onChange={(e) => setStructureType(e.target.value)}
        >
          <option value="%">--Select Structure Type--</option>
          {structureTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bridge Name Filter */}
      <div>
        <input
          type="text"
          id="bridge-name"
          className="w-full border border-[#3B82F6] rounded p-1 bg-gray-200"
          placeholder="Search Bridge Name..."
          value={bridgeName}
          onChange={(e) => setBridgeName(e.target.value)}
        />
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="p-2 bg-[#3B82F6] text-white rounded hover:bg-blue-700"
      >
        <FaSearch />
      </button>
    </div>
  );
};

export default Filters;
