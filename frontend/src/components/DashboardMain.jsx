import React from "react";
import { UserIcon, DocumentIcon } from "@heroicons/react/24/outline";

const DashboardMain = () => {
  const cardData = [
    { label: "Total", value: "18,705", icon: <UserIcon className="w-10 h-10 text-blue-500" />, color: "blue" },
    { label: "Bridge", value: "1,396", icon: <DocumentIcon className="w-10 h-10 text-blue-500" />, color: "blue" },
    { label: "Culvert", value: "17,262", icon: <DocumentIcon className="w-10 h-10 text-green-500" />, color: "green" },
    { label: "Underpass", value: "10", icon: <DocumentIcon className="w-10 h-10 text-red-500" />, color: "red" },
  ];

  const inspectionData = [
    { label: "Bridges", value: "1,501", icon: <DocumentIcon className="w-10 h-10 text-blue-500" />, color: "blue" },
    { label: "Checkings", value: "23,178", icon: <DocumentIcon className="w-10 h-10 text-blue-500" />, color: "blue" },
  ];

  // Card Component
  const Card = ({ label, value, icon, color }) => (
    <div
      className={`border-2 border-${color}-500 bg-white p-4 rounded-lg shadow-lg flex items-center gap-4`}
    >
      <div>{icon}</div>
      <div>
        <h4 className="text-lg font-semibold text-gray-700">{label}</h4>
        <p className={`text-${color}-500 text-2xl font-bold`}>{value}</p>
      </div>
    </div>
  );

  return (
    <section className="p-4 bg-gray-100 min-h-screen">
      {/* Bridges Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-500 mb-4">Bridges</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cardData.map((card, index) => (
            <Card
              key={index}
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      </div>

      {/* Inspections Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-500 mb-4">Inspections</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {inspectionData.map((card, index) => (
            <Card
              key={index}
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardMain;
