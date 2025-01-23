import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const Map = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const [Map, MapView, MapImageLayer, LayerList] = await loadModules(
          [
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/MapImageLayer",
            "esri/widgets/LayerList"
          ],
          { css: true }
        );

        // Initialize Map
        const map = new Map({
          basemap: "gray-vector"
        });

        // Initialize MapView
        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [73.1587, 31.5204],
          zoom: 6,
          constraints: {
            minZoom: 1,
            maxZoom: 18
          }
        });

        viewRef.current = view;

        // Define Popup Template for Road Layer
        const popupTemplate = {
          title: "{road_name}",
          content: `
            <div>
              <p><strong>Road:</strong> {road_name}</p>
              <p><strong>District:</strong> {district}</p>
              <p><strong>Inventory Score:</strong> {inventory_score}</p>
              <p><strong>Inspection Score:</strong> {inspection_score}</p>
              <p><strong>Budget Cost:</strong> {budget_cost}</p>
              <div>
                <img src="{image1}" alt="Image 1" style="width:100px;" />
                <img src="{image2}" alt="Image 2" style="width:100px;" />
                <img src="{image3}" alt="Image 3" style="width:100px;" />
              </div>
            </div>
          `
        };

        // Road Layer with Popup Template
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "BMS",
          opacity: 0.8,
          listMode: "show",
          sublayers: [
            {
              id: 0,
              title: "Roads",
              popupTemplate: popupTemplate
            }
          ]
        });

        map.add(roadLayer);

        // Layer List Widget
        const layerList = new LayerList({
          view: view,
          listItemCreatedFunction: (event) => {
            // Customize Layer List items
            const item = event.item;
            if (item.layer === roadLayer) {
              item.panel = {
                content: "legend",
                open: true
              };
            }
          }
        });

        // Add Layer List to the view
        view.ui.add(layerList, "top-right");

        await view.when();
        console.log("EzriMap is ready.");
      } catch (error) {
        console.error("Error initializing EzriMap:", error);
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
    <div className="bg-white border-2 border-blue-400 p-2 rounded-lg shadow-md">
      <div
        ref={mapRef}
        className="map-container"
        style={{ height: "500px" }}
      />
    </div>
  );
};

export default Map;