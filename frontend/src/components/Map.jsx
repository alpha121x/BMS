import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Map = () => {
  const [bridges, setBridges] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBridges = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/bridgecordinates');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setBridges(data);
        } else {
          setError('No bridge data received');
        }
      } catch (error) {
        console.error("Error fetching bridge data:", error);
        setError(error.message);
      }
    };
    
    fetchBridges();
  }, []);

  // Coordinates for Lahore, Pakistan
  const center = [31.5497, 74.3436];

  return (
    <div className="w-full h-96 relative">
      {error && (
        <div className="absolute top-0 left-0 z-50 bg-red-100 p-2 m-2 rounded">
          Error: {error}
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={10}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {bridges.map((bridge) => (
          <Marker
            key={bridge.ObjectID}
            // Note the order: [YCentroID, XCentroID] for [latitude, longitude]
            position={[bridge.YCentroID, bridge.XCentroID]}
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