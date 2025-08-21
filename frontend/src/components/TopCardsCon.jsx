// import React from "react";

// const TopCardCon = ({ inspectedCards }) => {
//     const addCommas = (x) => {
//         if (!x || x === "N/A") return "N/A";
//         var parts = x.toString().split(".");
//         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//         return parts.join(".");
//     };

//     return (
//         <div className="mb-2">
//             <div className="grid grid-cols-2 gap-4">
//                 {inspectedCards.map((card, index) => (
//                     <div
//                         key={index}
//                         className="rounded-lg shadow-lg text-white transition-all duration-300 hover:shadow-xl p-5" // Increased padding
//                         style={{
//                             background: card.color,
//                             border: "1px solid #ddd",
//                             borderRadius: "8px",
//                         }}
//                     >
//                         <div className="flex flex-col items-start">
//                             <h6 className="mb-2 font-bold text-white text-lg">{card.label}</h6>
//                             <div className="text-3xl font-bold text-white">{addCommas(card.value)}</div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default TopCardCon;

import React, { useState } from "react";
import { Modal } from "react-bootstrap"; // 👈 Bootstrap modal
import { BASE_URL } from "./config";
import StructuresTable from "./StructuresTable"; // import here

const TopCardCon = ({ inspectedCards, districtId, type }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state


  const addCommas = (x) => {
    if (!x || x === "N/A") return "N/A";
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleCardClick = async (type) => {
    setSelectedType(type);
    setModalOpen(true);
    setLoading(true);

    try {
      console.log("Fetching structures for type:", type, "and districtId:", districtId);
      return;
      const response = await fetch(`${BASE_URL}/api/strucutres?type=${type}&districtId=${districtId}`);
      const data = await response.json();
      setStructures(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching structures:", err);
      setStructures([]);
      setLoading(false);
    }
  };

  return (
    <div className="mb-2">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inspectedCards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.type)}
            className="cursor-pointer rounded-lg shadow-md text-white transition-all duration-300 hover:shadow-xl px-3 py-5"
            style={{
              background: card.color,
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <div className="flex flex-col items-start">
              <h6 className="mb-1 font-semibold text-white text-lg">
                {card.label}
              </h6>
              <div className="text-3xl font-bold text-white">
                {addCommas(card.value)}
              </div>
            </div>
          </div>
        ))}
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
          <StructuresTable 
          loading={loading}
          data={structures} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TopCardCon;
