import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css"; // Ensure this is imported

const MapModal = ({ location, markerLabel, bridgeName, district, road }) => {
  if (!location) return null;

  // Correct the coordinates
  const { latitude: rawLat, longitude: rawLon } = location;
  const latitude = rawLat; // Swap if needed
  const longitude = rawLon;
  console.log("Corrected:", latitude, longitude);

  const InvalidateMapSize = () => {
    const map = useMap();
    useEffect(() => {
      // Invalidate size after a short delay to ensure modal is visible
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }, [map]);
    return null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
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
            <InvalidateMapSize />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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