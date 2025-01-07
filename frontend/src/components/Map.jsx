import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const EzriMap = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const [Map, MapView, MapImageLayer, LayerList, Home, Legend] = await loadModules(
          [
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/MapImageLayer",
            "esri/widgets/LayerList",
            "esri/widgets/Home",
            "esri/widgets/Legend"
          ],
          { css: true }
        );

        // Create Map
        const map = new Map({
          basemap: "gray-vector"
        });

        // Create MapView
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

        // Add Road Layer
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "Road Network",
          opacity: 0.8,
          listMode: "hide-children"
        });

        map.add(roadLayer);

        // Add LayerList Widget
        view.ui.add(
          new LayerList({
            view: view
          }),
          "top-right"
        );

        // Add Home Widget
        view.ui.add(
          new Home({
            view: view
          }),
          "top-left"
        );

        // Add Legend Widget
        const legend = new Legend({
          view: view,
          visible: false // Initially hidden
        });
        view.ui.add(legend, "bottom-right");

        // Watch Layer Visibility for Legend Control
        roadLayer.watch("visible", (isVisible) => {
          legend.visible = isVisible;
        });

        // Ensure MapView readiness
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
