import React, { useState, useEffect } from "react";
import { BASE_URL } from "./config";

const FilterComponent = ({ setSelectedDistrict, setStartDate }) => {
  const [districts, setDistricts] = useState([]);
  const [zones, setZones] = useState([]);
  const [districtId, setDistrictId] = useState("");
  const [startDate, setStartDateState] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Off-canvas toggle state

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

  // Default date to current day
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

  // Handlers for inputs
  const handleDateChange = (e) => setStartDate(e.target.value);
  const handleZoneChange = (e) => setSelectedDistrict(e.target.value);
  const handleDistrictChange = (e) => {
    setDistrictId(e.target.value);
    setSelectedDistrict(e.target.value);
  };

  return (
    <div>
      {/* Off-Canvas Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md"
      >
        Open Filters
      </button>

      {/* Off-Canvas Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out w-72 z-50`}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              ✖
            </button>
          </div>

          {/* Zone Filter */}
          <div className="mb-4">
            <label
              htmlFor="zone-filter"
              className="block text-gray-700 font-medium mb-1"
            >
              Select Zone
            </label>
            <select
              id="zone-filter"
              className="w-full border rounded-md p-2 bg-gray-100"
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
            <label
              htmlFor="district-filter"
              className="block text-gray-700 font-medium mb-1"
            >
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

          {/* Date Filter */}
          <div className="mb-4">
            <label
              htmlFor="date-filter"
              className="block text-gray-700 font-medium mb-1"
            >
              Select Date
            </label>
            <input
              id="date-filter"
              type="date"
              className="w-full border rounded-md p-2 bg-gray-100"
              value={startDate || ""}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default FilterComponent;
