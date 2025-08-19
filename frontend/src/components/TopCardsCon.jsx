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

// Example modal component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-red-500 font-bold text-lg">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const TopCardCon = ({ inspectedCards }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [structures, setStructures] = useState([]);

  const addCommas = (x) => {
    if (!x || x === "N/A") return "N/A";
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleCardClick = async (type) => {
    setSelectedType(type);
    setModalOpen(true);

    try {
      // Call API depending on type
      const response = await fetch(`/api/structures?type=${type}`);
      const data = await response.json();
      setStructures(data || []);
    } catch (err) {
      console.error("Error fetching structures:", err);
      setStructures([]);
    }
  };

  return (
    <div className="mb-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inspectedCards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.type)} // pass type to backend
            className="cursor-pointer rounded-lg shadow-md text-white transition-all duration-300 hover:shadow-xl px-3 py-5"
            style={{
              background: card.color,
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <div className="flex flex-col items-start">
              <h6 className="mb-1 font-semibold text-white text-lg">{card.label}</h6>
              <div className="text-3xl font-bold text-white">
                {addCommas(card.value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedType ? `Structures: ${selectedType}` : "Structures"}
      >
        {structures.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {structures.map((item, i) => (
              <li key={i}>{item.bridge_name || `Structure #${i + 1}`}</li>
            ))}
          </ul>
        ) : (
          <p>No structures found.</p>
        )}
      </Modal>
    </div>
  );
};

export default TopCardCon;

