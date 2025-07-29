import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '../index.css';
import { BASE_URL } from "./config";

const InspectionMap = () => {
  useEffect(() => {
    // Initialize map
    const map = L.map("map").setView([30.3753, 69.3451], 7); // Centered on Pakistan

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Fetch GeoJSON from backend
    fetch(`${BASE_URL}/api/inspection-points`)
      .then((res) => res.json())
      .then((data) => {
        L.geoJSON(data, {
          pointToLayer: (feature, latlng) =>
            L.circleMarker(latlng, {
              radius: 7,
              fillColor: feature.properties.color,
              color: "#000",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8,
            }),
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindPopup(
              `<strong>${props.bridge_name}</strong><br>Status: ${props.status}`
            );
          },
        }).addTo(map);
      });

    // Add Legend
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.innerHTML = `
        <h4>Inspections Status</h4>
        <i style="background:red; width:12px; height:12px; display:inline-block; margin-right:5px;"></i> Pending<br/>
        <i style="background:green; width:12px; height:12px; display:inline-block; margin-right:5px;"></i> Approved<br/>
      `;
      return div;
    };

    legend.addTo(map);

    // Cleanup on unmount
    return () => map.remove();
  }, []);

  return <div id="map" style={{ height: "600px", width: "100%" }}></div>;
};

export default InspectionMap;
