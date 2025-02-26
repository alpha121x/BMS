import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const MapModal = ({ location, markerLabel, bridgeName, district, road }) => {
  if (!location) return null;

  const { latitude, longitude } = location;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Bridge Details */}
        <div className="bridge-details">
          <p>
            <strong>Bridge:</strong> {bridgeName} <br />
            <strong>District:</strong> {district} <br />
            <strong>Road:</strong> {road}
          </p>
        </div>
        <div style={{ height: "400px", width: "100%" }}>
          <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[latitude, longitude]}>
              <Popup>{markerLabel || "Location"}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapModal;