import React, { useEffect, useState } from "react";
import { loadModules } from "esri-loader";

const EsriMap = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    let view;

    // Load the Esri modules
    loadModules(
      ["esri/Map", "esri/views/MapView", "esri/layers/MapImageLayer"],
      { css: true }
    )
      .then(([EsriMap, MapView, MapImageLayer]) => {
        // Create the map
        const map = new EsriMap({
          basemap: "streets-navigation-vector", // Set the basemap
        });

        // Create the map view
        view = new MapView({
          container: "esriMapView", // HTML container id
          map: map,
          center: [74.3436, 31.5497], // Default center coordinates [longitude, latitude]
          zoom: 10, // Initial zoom level
        });

        // Add the MapImageLayer for the provided service
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
        });

        map.add(roadLayer);

        // Additional Layer Customization: You can add layer visibility control, etc.
        roadLayer.when(() => {
          console.log("Road layer is loaded.");
        });

        // View initialization
        view.when(() => {
          console.log("Map and view are ready");
        });
      })
      .catch((err) => {
        console.error("Error loading Esri modules:", err);
        setError("Failed to load the map. Please try again.");
      });

    // Cleanup function
    return () => {
      if (view) {
        view.container = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-96 relative">
      {error && (
        <div className="absolute top-0 left-0 z-50 bg-red-100 p-2 m-2 rounded">
          Error: {error}
        </div>
      )}
      <div id="esriMapView" className="w-full h-full"></div>
    </div>
  );
};

export default EsriMap;
