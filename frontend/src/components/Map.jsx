import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const EzriMap = () => {
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
          center: [74.3436, 31.5497],
          zoom: 11,
          constraints: {
            minZoom: 9,
            maxZoom: 18
          }
        });

        viewRef.current = view;

        // Road Layer
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "BMS",
          opacity: 0.8,
          listMode: "show" // Ensure all layers are displayed properly
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
        style={{ height: "400px" }}
      />
    </div>
  );
};

export default EzriMap;
