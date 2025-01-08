import React, { useState, useEffect } from "react";
import { BASE_URL } from "./config";

const FilterComponent = ({
  setSelectedDistrict,
  setSelectedZone,
}) => {
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [districtId, setDistrictId] = useState("");
  const [zoneId, setZoneId] = useState(""); // Added state for zone

  // Fetch districts and zones
  useEffect(() => {
    const fetchDistrictsAndZones = async () => {
      try {
        const districtResponse = await fetch(`${BASE_URL}/api/districts`);
        const districtData = await districtResponse.json();
        setDistricts(districtData);

        const zoneResponse = await fetch(`${BASE_URL}/api/zones`);
        const zoneData = await zoneResponse.json();
        setZones(zoneData);
      } catch (error) {
        console.error("Error fetching districts and zones:", error);
      }
    };
    fetchDistrictsAndZones();
  }, []);

  // Handle zone change
  const handleZoneChange = (e) => {
    // console.log("Selected Zone:", e.target.value);  // Log selected zone
    setZoneId(e.target.value);
    setSelectedZone(e.target.value);  // Set the selected zone
  };

  // Handle district change
  const handleDistrictChange = (e) => {
    // console.log("Selected District:", e.target.value);  // Log selected district
    setDistrictId(e.target.value);
    setSelectedDistrict(e.target.value);  // Set the selected district
  };

  return (
    <div className="p-4">
      {/* Zone Filter */}
      <div className="mb-4">
        <label htmlFor="zone-filter" className="block text-gray-700 font-medium mb-1">
          Select Zone
        </label>
        <select
          id="zone-filter"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={zoneId} // Added value to control the zone selection
          onChange={handleZoneChange}
        >
          <option value="%">--All Zones--</option>
          {zones.map((zone) => (
            <option key={zone.ZoneID} value={zone.ZoneID}>
              {zone.ZoneName}
            </option>
          ))}
        </select>
      </div>

      {/* District Filter */}
      <div className="mb-4">
        <label htmlFor="district-filter" className="block text-gray-700 font-medium mb-1">
          Select District
        </label>
        <select
          id="district-filter"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={districtId}
          onChange={handleDistrictChange}
        >
          <option value="%">--All Districts--</option>
          {districts.map((district) => (
            <option key={district.DistrictsID} value={district.DistrictsID}>
              {district.DistrictsName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterComponent;
