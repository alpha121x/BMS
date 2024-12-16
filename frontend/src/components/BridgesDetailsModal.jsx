import React from "react";
import { Modal, Carousel } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});


const BridgeDetailsModal = ({ selectedBridge }) => {
  const photos = selectedBridge?.Photos || [];
  const latitude = selectedBridge?.Latitude || 31.1704; // Default Punjab
  const longitude = selectedBridge?.Longitude || 72.7097;
  console.log("Latitude:", latitude, "Longitude:", longitude);

  return (
    <Modal.Body>
      <table className="w-100 border-collapse border text-sm mb-3">
        <tbody>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Road Name
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.Road || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Visual Condition
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.VisualCondition || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Width Of Bridge
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.WidthStructure || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Span Length
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.SpanLength || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              No Of Spans
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.Spans || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Construction Year
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.ConstructionYear || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Survey ID
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.SurveyID || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Road Classification
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.RoadClassification || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Road Surface Type
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.RoadSurfaceType || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Carriageway Type
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.CarriagewayType || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Last Maintenance Date
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.LastMaintenanceDate || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Direction
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.Direction || "N/A"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
              Visual Condition
            </th>
            <td className="border border-gray-200 px-4 py-2">
              {selectedBridge?.VisualCondition || "N/A"}
            </td>
          </tr>
          {/* Map Row */}
          {latitude && longitude && (
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left bg-gray-100">
                Bridge Location
              </th>
              <td className="border border-gray-200 p-0">
                <div style={{ height: "200px", width: "100%" }}>
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[latitude, longitude]} icon={customIcon}>
                      <Popup>
                        {selectedBridge?.BridgeName || "Bridge Location"}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Photo Carousel */}
      {photos.length > 0 && (
        <Carousel>
          {photos.map((photo, index) => (
            <Carousel.Item key={index}>
              <img
                className="d-block w-100"
                src={photo}
                alt={`Bridge Photo ${index + 1}`}
                style={{ maxHeight: "300px", objectFit: "cover" }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      )}
    </Modal.Body>
  );
};

export default BridgeDetailsModal;
