import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../index.css";
import { BASE_URL } from "./config";

const InspectionMap = ({ map_endpoint }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize map
const map = L.map("map");
const punjabBounds = [
  [27.5, 69.5], // Southwest
  [32.9, 75.5], // Northeast
];
map.fitBounds(punjabBounds);


    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    let geoJsonLayer = null;

    const fetchPoints = () => {
      const bounds = map.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ].join(",");

      fetch(`${BASE_URL}/api/${map_endpoint}?bbox=${bbox}`)
        .then((res) => res.json())
        .then((data) => {
          if (geoJsonLayer) {
            map.removeLayer(geoJsonLayer);
          }

          geoJsonLayer = L.geoJSON(data, {
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
    };

    // Fetch on map load
    fetchPoints();

    // Fetch on moveend (pan or zoom)
    map.on("moveend", fetchPoints);

    // Legend
    const legend = L.control({ position: "topright" });
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

    return () => map.remove();
  }, []);

  return <div id="map" style={{ height: "600px", width: "100%" }}></div>;
};

export default InspectionMap;
