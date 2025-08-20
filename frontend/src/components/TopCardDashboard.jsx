// import React from "react";

// const TopCardDashboard = ({ totalLabel, totalValue, color, items }) => {
//     const addCommas = (x) => {
//         if (!x) return "0";
//         var parts = x.toString().split(".");
//         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//         return parts.join(".");
//     };

//     return (
//         <div
//             className="rounded-1 shadow-lg text-white transition-all duration-300 hover:shadow-xl p-3"
//             style={{
//                 background: color,
//                 border: "1px solid #ddd",
//                 borderRadius: "8px",
//             }}
//         >
//             {/* Top Section - Total Count */}
//             <div className="flex justify-between items-center border-b border-white pb-2 mb-2">
//                 <h6 className="mb-0 font-bold text-white text-lg">{totalLabel}</h6>
//                 <div className="text-3xl font-bold text-white">{addCommas(totalValue)}</div>
//             </div>

//             {/* Bottom Section - Three Counts */}
//             <div className="grid grid-cols-3 gap-2">
//                 {items.map((item, index) => (
//                     <div
//                         key={index}
//                         className="flex flex-col items-center text-center p-2 rounded-md"
//                         style={{
//                             background: "rgba(255, 255, 255, 0.2)", // Semi-transparent background
//                             borderRadius: "4px",
//                         }}
//                     >
//                         {/*<div className="text-xl">{item.icon}</div>*/}
//                         <h6 className="text-sm font-semibold">{item.label}</h6>
//                         <div className="text-lg font-bold">{addCommas(item.value)}</div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default TopCardDashboard;

import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { BASE_URL } from "./config";
import StructuresTable from "./StructuresTable";

const TopCardDashboard = ({ type, totalLabel, totalValue, color, items, districtId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  console.log(districtId);


  const addCommas = (x) => {
    if (!x) return "0";
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleItemClick = async (type) => {
    setSelectedType(type);
    setModalOpen(true);
    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/structures-dashboard?type=${type}&district=${districtId}`
      );
      const data = await response.json();

      // ✅ ensure structures is always an array
      setStructures(data.structures || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching structures:", err);
      setStructures([]);
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="rounded-1 shadow-lg text-white transition-all duration-300 hover:shadow-xl p-3"
        style={{
          background: color,
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        {/* Top Section - Total Count */}
        <div
          className="flex justify-between items-center border-b border-white pb-2 mb-2 cursor-pointer hover:opacity-80"
          onClick={() => handleItemClick(type)} // 👈 click on heading
        >
          <h6 className="mb-0 font-bold text-white text-lg">{totalLabel}</h6>
          <div className="text-3xl font-bold text-white">
            {addCommas(totalValue)}
          </div>
        </div>

        {/* Bottom Section - Three Counts */}
        <div className="grid grid-cols-3 gap-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-2 rounded-md  hover:bg-opacity-40"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
              }}
            >
              <h6 className="text-sm font-semibold">{item.label}</h6>
              <div className="text-lg font-bold">{addCommas(item.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Bootstrap Modal */}
      <Modal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedType
              ? `Structures: ${selectedType.toUpperCase()}`
              : "Structures"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StructuresTable data={structures}
          loading={loading}
           />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TopCardDashboard;
