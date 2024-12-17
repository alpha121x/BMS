import React from "react";
import { Modal, Carousel } from "react-bootstrap";

const CheckingDetailsModal = ({ selectedRow }) => {
  // Log selectedRow.Photos for debugging purposes
  console.log(selectedRow?.Photos);

  return (
    <Modal.Body>
      {/* Table Structure */}
      <table className="w-100 border-collapse border text-sm mb-3">
        <tbody>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Span Index
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedRow?.SpanIndex || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Damage Kind
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedRow?.DamageKindName || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Damage Level
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedRow?.DamageLevel || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Remarks
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedRow?.Remarks || "N/A"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Photos Carousel */}
      {selectedRow?.Photos && selectedRow.Photos.length > 0 ? (
        <div className="mb-3">
          <h5>Photos</h5>
          <Carousel>
            {selectedRow.Photos.map((photo, index) => (
              <Carousel.Item key={index}>
                <img
                  className="d-block w-100"
                  src={photo || 'https://via.placeholder.com/150'} // Placeholder if no photo URL
                  alt={`Photo ${index + 1}`}
                  style={{ maxHeight: "300px", objectFit: "cover" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      ) : (
        <p>No photos available</p> // Message when no photos are available
      )}
    </Modal.Body>
  );
};

export default CheckingDetailsModal;
