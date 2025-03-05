import React, { useState, useEffect } from "react";
import { BASE_URL } from "./config";
import { FaSearch } from "react-icons/fa";

const Filters = ({ districtId, setDistrictId, structureType, setStructureType, bridgeName, setBridgeName }) => {
  const [districts, setDistricts] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);

  // Temporary state for filtering
  const [tempDistrictId, setTempDistrictId] = useState(districtId);
  const [tempStructureType, setTempStructureType] = useState(structureType);
  const [tempBridgeName, setTempBridgeName] = useState(bridgeName);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const districtResponse = await fetch(`${BASE_URL}/api/districts`);
        const districtData = await districtResponse.json();
        setDistricts(districtData.map(d => ({ id: d.id, district: d.district || d.name })));

        const structureTypeResponse = await fetch(`${BASE_URL}/api/structure-types`);
        const structureTypesData = await structureTypeResponse.json();
        setStructureTypes(structureTypesData.map(type => ({ id: type.id, name: type.structure_type || type.name })));
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  const handleSearch = () => {
    setDistrictId(tempDistrictId);
    setStructureType(tempStructureType);
    setBridgeName(tempBridgeName);
  };

  return (
    <div className="flex items-center gap-2 justify-between">
      <select className="w-full border border-[#3B82F6] rounded p-1 bg-gray-200"
        value={tempDistrictId} onChange={(e) => setTempDistrictId(e.target.value)}>
        <option value="%">--Select District--</option>
        {districts.map(d => <option key={d.id} value={d.id}>{d.district}</option>)}
      </select>

      <select className="w-full border border-[#3B82F6] rounded p-1 bg-gray-200"
        value={tempStructureType} onChange={(e) => setTempStructureType(e.target.value)}>
        <option value="%">--Select Structure Type--</option>
        {structureTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
      </select>

      <input type="text" className="w-full border border-[#3B82F6] rounded p-1 bg-gray-200"
        placeholder="Search Bridge Name..."
        value={tempBridgeName} onChange={(e) => setTempBridgeName(e.target.value)} />

      <button onClick={handleSearch} className="p-2 bg-[#3B82F6] text-white rounded hover:bg-blue-700">
        <FaSearch />
      </button>
    </div>
  );
};

export default Filters;
