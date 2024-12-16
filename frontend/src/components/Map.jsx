// MapComponent.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  // Coordinates for Punjab, Pakistan
  const center = [31.5497, 74.3436]; // Latitude and Longitude of Punjab, Pakistan

  return (
    <MapContainer
      center={center}
      zoom={10} // Adjust zoom level as needed
      style={{ width: '100%', height: '370px' }} // Ensure it takes the full height of its container
    >
      {/* TileLayer for OpenStreetMap */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Marker on the map */}
      <Marker position={center}>
        <Popup>
          Punjab, Pakistan
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
