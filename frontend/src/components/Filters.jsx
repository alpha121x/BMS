import { useState, useEffect } from "react";
import { BASE_URL } from "./config";
import { FaSearch } from "react-icons/fa";

const Filters = ({ districtId, setDistrictId, structureType, setStructureType, bridgeName, setBridgeName, flexDirection, padding }) => {
  const [districts, setDistricts] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);
  const [isDistrictDisabled, setIsDistrictDisabled] = useState(false); // New state to track disable condition

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

        // Retrieve and decode userEvaluation token
        const token = localStorage.getItem("userEvaluation");
        if (token) {
          try {
            const userToken = JSON.parse(token);
            const userId = userToken.userId?.toString(); // Ensure userId is a string
            const districtIdFromToken = userToken.districtId?.toString();

            // Check if userId is in range 8 to 12
            const shouldDisable = userId && ["8", "9", "10", "11", "12"].includes(userId);
            const userDistrictId = shouldDisable ? "11" : (districtIdFromToken || districtId);
            console.log("userId:", userId, "shouldDisable:", shouldDisable, "userDistrictId:", userDistrictId); // Debugging

            if (userDistrictId && districtData.some(d => d.id.toString() === userDistrictId)) {
              setTempDistrictId(userDistrictId);
              setDistrictId(userDistrictId); // Update parent state
              setIsDistrictDisabled(shouldDisable); // Set disable flag
            }
          } catch (error) {
            console.error("Error decoding JWT token:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, [setDistrictId]); // Add setDistrictId to dependency array

  const handleSearch = () => {
    setDistrictId(tempDistrictId);
    setStructureType(tempStructureType);
    setBridgeName(tempBridgeName);
  };

  return (
    <div className={`flex ${flexDirection} items-center gap-2 justify-center`}>
      <select
        className={`w-full border border-[#3B82F6] rounded-1 ${padding} text-gray-400 ${isDistrictDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        value={tempDistrictId}
        onChange={(e) => setTempDistrictId(e.target.value)}
        disabled={isDistrictDisabled} // Disable only for userId 8-12
      >
        {isDistrictDisabled ? (
          districts
            .filter(d => d.id.toString() === tempDistrictId)
            .map(d => (
              <option key={d.id} value={d.id}>
                {d.district}
              </option>
            ))
        ) : (
          <>
            <option value="%">Select District</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>
                {d.district}
              </option>
            ))}
          </>
        )}
      </select>

      <select
        className={`w-full border border-[#3B82F6] rounded-1 ${padding} text-gray-400`}
        value={tempStructureType}
        onChange={(e) => setTempStructureType(e.target.value)}
      >
        <option value="%">Select Structure Type</option>
        {structureTypes.map(type => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
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
        style={{ padding: '10px 20px' }}
      >
        <FaSearch />
      </button>
    </div>
  );
};

export default Filters;