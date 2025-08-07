import React, { useState, useEffect } from "react";
import { BASE_URL } from "./config";
import { FaSearch } from "react-icons/fa";

const Filters = ({
  districtId,
  setDistrictId,
  structureType,
  setStructureType,
  bridgeName,
  setBridgeName,
  flexDirection,
  padding
}) => {
  const [districts, setDistricts] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);

  // Temporary states for filters
  const [tempDistrictId, setTempDistrictId] = useState(districtId);
  const [tempStructureType, setTempStructureType] = useState(structureType);
  const [tempBridgeName, setTempBridgeName] = useState(bridgeName);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const userTokenRaw = sessionStorage.getItem("user") || sessionStorage.getItem("userEvaluation");

        let districtIdFromToken = "%";
        if (userTokenRaw) {
          const parsedToken = JSON.parse(userTokenRaw);
          const district = parsedToken?.districtId?.toString();
          districtIdFromToken = !district || district === "0" ? "%" : district;
        }

        // Set default values for dropdowns
        setTempDistrictId(districtIdFromToken);
        setDistrictId(districtIdFromToken); // Update parent as well

        // Fetch districts (either all or single)
        const districtQuery = districtIdFromToken === "%" ? "" : `?districtId=${districtIdFromToken}`;
        const districtResponse = await fetch(`${BASE_URL}/api/districts${districtQuery}`);
        const districtData = await districtResponse.json();
        setDistricts(districtData.map(d => ({
          id: d.id.toString(),
          district: d.district || d.name
        })));

        // Fetch structure types
        const structureTypeResponse = await fetch(`${BASE_URL}/api/structure-types`);
        const structureTypesData = await structureTypeResponse.json();
        setStructureTypes(structureTypesData.map(type => ({
          id: type.id.toString(),
          name: type.structure_type || type.name
        })));

      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, [setDistrictId]);

  const handleSearch = () => {
    setDistrictId(tempDistrictId);
    setStructureType(tempStructureType);
    setBridgeName(tempBridgeName);
  };

  return (
    <div className={`flex ${flexDirection} items-center gap-2 justify-center`}>
      <select
        className={`w-full border border-[#3B82F6] rounded-1 ${padding} text-gray-400`}
        value={tempDistrictId}
        onChange={(e) => setTempDistrictId(e.target.value)}
      >
        <option value="%">Select District</option>
        {districts.map(d => (
          <option key={d.id} value={d.id}>{d.district}</option>
        ))}
      </select>

      <select
        className={`w-full border border-[#3B82F6] rounded-1 ${padding} text-gray-400`}
        value={tempStructureType}
        onChange={(e) => setTempStructureType(e.target.value)}
      >
        <option value="%">Select Structure Type</option>
        {structureTypes.map(type => (
          <option key={type.id} value={type.id}>{type.name}</option>
        ))}
      </select>

      <input
        type="text"
        className={`w-full border border-[#3B82F6] rounded-1 ${padding} text-gray-500`}
        placeholder="Search Bridge Name..."
        value={tempBridgeName}
        onChange={(e) => setTempBridgeName(e.target.value)}
      />

      <button
        onClick={handleSearch}
        className="w-full bg-[#005D7F] text-white rounded hover:bg-[#005D7F] flex items-center justify-center"
        style={{ padding: "10px 20px" }}
      >
        <FaSearch />
      </button>
    </div>
  );
};

export default Filters;
