import React, { useEffect, useState } from "react";
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
  padding,
}) => {
  const [districts, setDistricts] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);

  const [tempDistrictId, setTempDistrictId] = useState("%");
  const [tempStructureType, setTempStructureType] = useState("%");
  const [tempBridgeName, setTempBridgeName] = useState("");

  // ✅ Load saved filters on mount
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("mainFilters") || "{}");

    setTempDistrictId(saved.districtId || districtId || "%");
    setTempStructureType(saved.structureType || structureType || "%");
    setTempBridgeName(saved.bridgeName || bridgeName || "");
  }, []);

  // ✅ Save whenever temp filters change
  useEffect(() => {
    sessionStorage.setItem(
      "mainFilters",
      JSON.stringify({
        districtId: tempDistrictId,
        structureType: tempStructureType,
        bridgeName: tempBridgeName,
      })
    );
  }, [tempDistrictId, tempStructureType, tempBridgeName]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [districtRes, typeRes] = await Promise.all([
          fetch(`${BASE_URL}/api/districts`),
          fetch(`${BASE_URL}/api/structure-types`),
        ]);
        const districtData = await districtRes.json();
        const typeData = await typeRes.json();

        setDistricts(
          districtData.map((d) => ({
            id: d.id.toString(),
            district: d.district || d.name,
          }))
        );
        setStructureTypes(
          typeData.map((t) => ({
            id: t.id.toString(),
            name: t.structure_type || t.name,
          }))
        );
      } catch (err) {
        console.error("Error fetching filters:", err);
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
    <div className={`flex ${flexDirection} items-center gap-2 justify-center`}>
      <select
        className={`w-full border border-[#3B82F6] rounded-1 ${padding} text-gray-400`}
        value={tempDistrictId}
        onChange={(e) => setTempDistrictId(e.target.value)}
      >
        <option value="%">Select District</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>{d.district}</option>
        ))}
      </select>

      <select
        className={`w-full border border-[#3B82F6] rounded-1 ${padding} text-gray-400`}
        value={tempStructureType}
        onChange={(e) => setTempStructureType(e.target.value)}
      >
        <option value="%">Select Structure Type</option>
        {structureTypes.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
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
        className="w-full bg-[#005D7F] text-white rounded hover:bg-[#004766] flex items-center justify-center"
        style={{ padding: "10px 20px" }}
      >
        <FaSearch />
      </button>
    </div>
  );
};

export default Filters;
