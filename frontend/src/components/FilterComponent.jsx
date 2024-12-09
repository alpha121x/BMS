import React, { useState, useEffect } from "react";
import { BASE_URL } from "./config";

const FilterComponent = ({ setSelectedDistrict, setStartDate }) => {
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [districtId, setDistrictId] = useState(""); // Local state for district selection
  const [startDate, setStartDateState] = useState("");

  // Fetch districts and zones on component mount
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

  // Set the current date as the start date only if startDate is not already set
  useEffect(() => {
    if (!startDate) {
      const today = new Date();
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      setStartDateState(formatDate(today));
    }
  }, [startDate]);

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate) {
      setStartDate(newDate);
    }
  };

  // Handle zone selection change
  const handleZoneChange = (e) => {
    const selectedZone = e.target.value;
    setSelectedDistrict(selectedZone); // You can pass the selected zone to the parent component
  };

  // Handle district selection change
  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setDistrictId(selectedDistrict); // Update local state
    setSelectedDistrict(selectedDistrict); // Propagate selected district to parent component
  };

  return (
    <div className="flex items-center justify-center space-x-5">
      {/* Zone Filter Card */}
      <div className="bg-white border-2 border-blue-400 rounded-lg shadow-md w-fit p-1">
        <div className="flex flex-col items-start">
          <label
            htmlFor="zone-filter"
            className="text-lg font-semibold text-gray-700 mb-1"
          >
            Select Zone
          </label>
          <select
            id="zone-filter"
            className="shadow bg-blue-400 appearance-none border-2 border-blue-400 rounded w-auto px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
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
      </div>

      {/* District Filter Card */}
      <div className="bg-white border-2 border-blue-400 rounded-lg shadow-md w-fit p-1">
        <div className="flex flex-col items-start">
          <label
            htmlFor="district-filter"
            className="text-lg font-semibold text-gray-700 mb-1"
          >
            Select District
          </label>
          <select
            id="district-filter"
            className="shadow bg-blue-400 appearance-none border-2 border-blue-400 rounded w-auto px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
            value={districtId}
            onChange={handleDistrictChange} // This is necessary to update the local state and pass the district to the parent
          >
            <option value="%">--All Districts--</option>
            {districts.map((district) => (
              <option key={district.DistrictsID} value={district.DistrictsID}>
                {district.DistrictsName} {/* Use DistrictsName for the display */}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Filter Card */}
      <div className="bg-white border-2 border-blue-400 rounded-lg shadow-md w-fit p-1">
        <div className="flex flex-col items-start">
          <label
            htmlFor="date-filter"
            className="text-lg font-semibold text-gray-700 mb-1"
          >
            Select Date
          </label>
          <input
            id="date-filter"
            type="date"
            className="shadow border-2 bg-blue-400 border-blue-400 rounded px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={startDate || ""}
            onChange={handleDateChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
