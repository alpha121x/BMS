import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css"; // Ensure Leaflet CSS is imported

const MapModal = ({ location, markerLabel, bridgeName, district, road }) => {
  // Check if location exists and has valid coordinates
  if (!location || !location.latitude || !location.longitude) {
    console.error("Invalid location data:", location);
    return <div className="modal-overlay">Error: Invalid location data</div>;
  }

  // Use the coordinates as provided (no swapping unless confirmed necessary)
  const { latitude, longitude } = location;
  
  // Validate that coordinates are numbers and within valid ranges
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (
    isNaN(lat) || isNaN(lon) ||
    lat < -90 || lat > 90 ||
    lon < -180 || lon > 180
  ) {
    console.error("Invalid coordinates:", latitude, longitude);
    return <div className="modal-overlay">Error: Invalid coordinates</div>;
  }

  console.log("Map coordinates:", lat, lon);

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
            <strong>Bridge:</strong> {bridgeName || "Unknown"} <br />
            <strong>District:</strong> {district || "Unknown"} <br />
            <strong>Road:</strong> {road || "Unknown"}
          </p>
        </div>
        <div style={{ height: "400px", width: "100%" }}>
          <MapContainer
            center={[lat, lon]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <InvalidateMapSize />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[lat, lon]}>
              <Popup>{markerLabel || "Location"}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapModal;