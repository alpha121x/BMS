import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BASE_URL } from "./config";

// Create a custom smaller icon
const smallIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconSize: [10, 19], // Adjust size for a smaller icon
  iconAnchor: [5, 19], // Anchor point for the icon
  popupAnchor: [1, -19], // Position of the popup relative to the icon
});


const Map = ({ selectedDistrict, selectedZone }) => {
  const [bridges, setBridges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBridgesByExtent = async (bounds) => {
    const { _southWest, _northEast } = bounds;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/api/bridgecoordinates?district=${selectedDistrict}&zone=${selectedZone}&southWestLat=${_southWest.lat}&southWestLng=${_southWest.lng}&northEastLat=${_northEast.lat}&northEastLng=${_northEast.lng}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setBridges(data);
      } else {
        setError("No bridge data found for the current map view.");
      }
    } catch (error) {
      console.error("Error fetching bridge data:", error);
      setError("Failed to fetch bridge data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const MapEventHandler = () => {
    const map = useMapEvents({
      moveend: () => {
        const bounds = map.getBounds();
        fetchBridgesByExtent(bounds);
      },
    });

    // Initial fetch based on default bounds
    useEffect(() => {
      const initialBounds = map.getBounds();
      fetchBridgesByExtent(initialBounds);
    }, [map]);

    return null;
  };

  const center = [31.5497, 74.3436]; // Default map center coordinates

  return (
    <div className="w-full h-96 relative">
      {loading && (
        <div className="absolute top-0 left-0 z-50 bg-yellow-100 p-2 m-2 rounded">
          Loading bridge data...
        </div>
      )}

      {error && !loading && (
        <div className="absolute top-0 left-0 z-50 bg-red-100 p-2 m-2 rounded">
          Error: {error}
        </div>
      )}

      <MapContainer center={center} zoom={10} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEventHandler />

        {bridges.map((bridge) => (
          <Marker
            key={bridge.ObjectID}
            position={[bridge.YCentroID, bridge.XCentroID]}
            icon={smallIcon}
          >
            <Popup>
              <strong>{bridge.BridgeName}</strong>
              <br />
              ID: {bridge.ObjectID}
              <br />
              Coordinates: ({bridge.YCentroID}, {bridge.XCentroID})
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
