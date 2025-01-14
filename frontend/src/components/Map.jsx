import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const EzriMapWithPopup = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const [Map, MapView, MapImageLayer, FeatureLayer] = await loadModules(
          [
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/MapImageLayer",
            "esri/layers/FeatureLayer"
          ],
          { css: true }
        );

        const map = new Map({
          basemap: "gray-vector"
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [74.3436, 31.5497],
          zoom: 11
        });

        viewRef.current = view;

        // Add the layer with popup enabled
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          sublayers: [
            {
              id: 0, // BRIDGES LOCATIONS layer ID
              title: "Bridges Locations",
              popupTemplate: {
                title: "{road_name}", // Adjust this field to match your data
                content: `
                  <div>
                    <p><strong>Road:</strong> {road_name}</p>
                    <p><strong>District:</strong> {district}</p>
                    <p><strong>Inventory Score:</strong> {inventory_score}</p>
                    <p><strong>Inspection Score:</strong> {inspection_score}</p>
                    <p><strong>Budget Cost:</strong> {budget_cost}</p>
                    <div>
                      <img src="{image1}" style="width:100px;" />
                      <img src="{image2}" style="width:100px;" />
                      <img src="{image3}" style="width:100px;" />
                    </div>
                    <div>
                      <button onclick="showInventoryInfo()">Inventory Information</button>
                      <button onclick="showInspectionInfo()">Inspection Information</button>
                    </div>
                  </div>
                `
              }
            }
          ],
          opacity: 0.8
        });

        map.add(roadLayer);

        await view.when();
        console.log("Map is ready.");
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();

    return () => {
      if (viewRef.current) {
        viewRef.current.container = null;
      }
    };
  }, []);

  return (
    <div className="map-container" ref={mapRef} style={{ height: "400px" }}></div>
  );
};

export default EzriMapWithPopup;

// Placeholder functions for button actions
function showInventoryInfo() {
  alert("Inventory Information button clicked!");
}

function showInspectionInfo() {
  alert("Inspection Information button clicked!");
}
