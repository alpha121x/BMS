import React from "react";
import { Modal, Carousel } from "react-bootstrap";

const CheckingDetailsModal = ({ selectedRow }) => {
  // Dummy photos for testing
  const dummyPhotos = [
    "uploads/bus_2024_01_14_12_39_49.jpg",
    "uploads/bus_2024_01_14_12_40_06.jpg",
    "uploads/bus_2024_01_14_12_40_38.jpg",
    "uploads/bus_2024_01_14_12_43_56.jpg",
    "uploads/bus_2024_01_14_12_45_26.jpg",
    "uploads/bus_2024_01_16_11_56_43.jpg"
  ];


//   bus_2024_01_14_12_39_49.jpg
// bus_2024_01_14_12_40_06.jpg
// bus_2024_01_14_12_40_38.jpg
// bus_2024_01_14_12_43_26.jpg
// bus_2024_01_14_12_43_56.jpg
// bus_2024_01_14_12_44_12.jpg
// bus_2024_01_14_12_44_40.jpg
// bus_2024_01_14_12_45_03.jpg
// bus_2024_01_14_12_45_26.jpg
// bus_2024_01_14_12_46_27.jpg
// bus_2024_01_14_12_47_28.jpg
// bus_2024_01_14_12_47_45.jpg
// bus_2024_01_15_12_44_58.jpg
// bus_2024_01_15_12_49_34.jpg
// bus_2024_01_15_12_52_09.jpg
// bus_2024_01_16_11_56_43.jpg
// bus_2024_01_16_11_58_26.jpg
// bus_2024_01_16_11_59_35.jpg
// bus_2024_01_16_12_01_36.jpg

  // Use dummy photos for testing, regardless of selectedRow.photos
  const photosToDisplay = dummyPhotos;

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
      {photosToDisplay && photosToDisplay.length > 0 ? (
        <div className="mb-3">
          <h5>Checking Photos</h5>
          <Carousel>
            {photosToDisplay.map((photo, index) => (
              <Carousel.Item key={index}>
                <img
                  className="d-block w-100"
                  src={`/${photo}`}  // Directly reference the public folder
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
