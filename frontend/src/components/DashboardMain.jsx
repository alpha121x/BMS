import React from "react";
import { UserIcon, DocumentIcon } from "@heroicons/react/24/outline";
import BridgeListing from "./BridgeListing";

const DashboardMain = () => {
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
      icon: <DocumentIcon className="w-10 h-10 text-green-500" />,
      color: "green",
    },
    {
      label: "Underpass",
      value: "10",
      icon: <DocumentIcon className="w-10 h-10 text-red-500" />,
      color: "red",
    },
  ];

  const inspectionData = [
    {
      label: "Bridges",
      value: "1,501",
      icon: <DocumentIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Checkings",
      value: "23,178",
      icon: <DocumentIcon className="w-10 h-10 text-blue-500" />,
      color: "blue",
    },
  ];

  const allCards = [...cardData, ...inspectionData]; // Combine both arrays

  const getBorderClass = (color) => {
    switch (color) {
      case "blue":
        return "border-blue-400 text-blue-500";
      case "green":
        return "border-green-400 text-green-500";
      case "red":
        return "border-red-400 text-red-500";
      default:
        return "border-gray-400 text-gray-500";
    }
  };

  // Card Component
  const Card = ({ label, value, icon, color }) => (
    <div
      className={`border-2 ${getBorderClass(
        color
      )} bg-white p-2 rounded-lg shadow-lg flex items-center gap-4`}
    >
      <div>{icon}</div>
      <div>
        <h4 className="text-lg font-semibold text-gray-700">{label}</h4>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <section className="p-4 bg-gray-100 min-h-screen">
      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-500 mb-2">
        Dashboard Overview
      </h2>

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
