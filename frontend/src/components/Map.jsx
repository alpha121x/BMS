import React, { useEffect, useState } from "react";
import { loadModules } from "esri-loader";

const EsriMap = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    let view;

    loadModules([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/MapImageLayer",
      "esri/widgets/LayerList",
      "esri/widgets/Legend"
    ], { css: true })
      .then(([Map, MapView, MapImageLayer, LayerList, Legend]) => {
        // Create the map with a light gray basemap
        const map = new Map({
          basemap: "gray-vector"
        });

        // Create the map view centered on Lahore
        view = new MapView({
          container: "esriMapView",
          map: map,
          center: [74.3436, 31.5497],
          zoom: 11,
          constraints: {
            minZoom: 9,
            maxZoom: 18
          }
        });

        // Add the road network layer
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "Road Network",
          opacity: 0.8,
          listMode: "hide-children" // This prevents showing sublayers in the layer list
        });

        // Add layer to the map
        map.add(roadLayer);

        // Add a layer list widget
        const layerList = new LayerList({
          view: view,
          container: "layerList",
          listItemCreatedFunction: (event) => {
            // This will ensure each layer only appears once
            const item = event.item;
            if (item.layer.type === "map-image") {
              item.panel = {
                content: "legend",
                open: true
              };
            }
          }
        });

        // Add a legend widget
        const legend = new Legend({
          view: view,
          container: "legend"
        });

        // Wait for the view to be ready
        view.when(() => {
          console.log("Map and view are ready");
        });
      })
      .catch((err) => {
        console.error("Error loading Esri modules:", err);
        setError("Failed to load the map. Please try again.");
      });

    return () => {
      if (view) {
        view.container = null;
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto h-96 relative"> {/* Adjusted height and width */}
      {error && (
        <div className="absolute top-0 left-0 z-50 bg-red-100 p-2 m-2 rounded text-red-700">
          {error}
        </div>
      )}
      <div id="esriMapView" className="w-full h-full" />
      <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-lg z-10">
        <div id="layerList" className="mb-4" />
        <div id="legend" />
      </div>
    </div>
  );
};

export default EsriMap;