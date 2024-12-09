import React, { useState } from "react";
import { UserIcon, DocumentIcon } from "@heroicons/react/24/outline";
import BridgeListing from "./BridgeListing";
import FilterComponent from "./FilterComponent";

const DashboardMain = () => {
  // State for district, start date, and district ID
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [districtId, setDistrictId] = useState(null);

  const cardData = [
    {
      label: "Total",
      value: "18,705",
      icon: <UserIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Bridge",
      value: "1,396",
      icon: <DocumentIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Culvert",
      value: "17,262",
      icon: <DocumentIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Underpass",
      value: "10",
      icon: <DocumentIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
  ];

  const inspectionData = [
    {
      label: "Bridges",
      value: "1,501",
      icon: <DocumentIcon className="w-10 h-10 text-green-500" />,
      color: "green",
    },
    {
      label: "Checkings",
      value: "23,178",
      icon: <DocumentIcon className="w-10 h-10 text-green-500" />,
      color: "green",
    },
  ];

  const allCards = [...cardData, ...inspectionData];

  const getBorderClass = (color) => {
    switch (color) {
      case "blue":
        return "border-blue-400 text-blue-500";
      case "green":
        return "border-green-400 text-green-500";
      default:
        return "border-gray-400 text-gray-500";
    }
  };

  // Card Component
  const Card = ({ label, value, icon, color }) => (
    <div
      className={`border-2 ${getBorderClass(
        color
      )} bg-white py-1 px-1.5 rounded-lg shadow-lg flex items-center gap-4`}
    >
      <div>{icon}</div>
      <div>
        <h4 className="text-lg font-semibold text-gray-700">{label}</h4>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
  

  return (
    <section className="p-2 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-2">
        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-500 mb-1">
          Dashboard Overview
        </h2>

        {/* Filter Component */}
        <FilterComponent
          setSelectedDistrict={setSelectedDistrict}
          setStartDate={setStartDate}
          districtId={districtId} // Pass districtId from parent
          setDistrictId={setDistrictId} // Pass setter for districtId
        />
      </div>

      {/* Combined Cards Section */}
      <div className="grid grid-cols-12 gap-4">
        {allCards.map((card, index) => (
          <div
            key={index}
            className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2"
          >
            <Card
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          </div>
        ))}
      </div>

      {/* Bridge Listing */}
      <div className="mt-2">
        <BridgeListing />
      </div>
    </section>
  );
};

export default DashboardMain;
