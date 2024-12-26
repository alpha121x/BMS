import React, { useEffect, useRef, useState } from "react";
import { loadModules } from "esri-loader";

const EsriMap = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);
  const [legendVisible, setLegendVisible] = useState(false); // State to control the visibility of the legend

  useEffect(() => {
    loadModules([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/MapImageLayer",
      "esri/widgets/LayerList",
      "esri/widgets/Home",
      "esri/widgets/Legend" // Importing the Legend widget
    ], { css: true })
      .then(([Map, MapView, MapImageLayer, LayerList, Home, Legend]) => {
        const map = new Map({
          basemap: "gray-vector"
        });

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

        // Add the road network layer
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "Road Network",
          opacity: 0.8,
          listMode: "hide-children"
        });

        map.add(roadLayer);

        // Add LayerList widget
        const layerList = new LayerList({
          view: view
        });
        view.ui.add(layerList, "top-right");

        // Add Home widget
        const homeBtn = new Home({
          view: view
        });
        view.ui.add(homeBtn, "top-left");

        // Add Legend widget but initially hide it
        const legend = new Legend({
          view: view,
          visible: false // Set the initial visibility to false
        });
        view.ui.add(legend, "bottom-right");

        // Event listener to show the legend when the road layer is clicked
        roadLayer.watch("visible", (newVisibility) => {
          if (newVisibility) {
            setLegendVisible(true); // Show the legend when the road layer is visible
            legend.visible = true;
          } else {
            setLegendVisible(false); // Hide the legend when the road layer is not visible
            legend.visible = false;
          }
        });

        // Wait for the view to be ready
        view.when(() => {
          // console.log("Map and view are ready");
        });
      })
      .catch((err) => {
        console.error("Error loading ESRI modules:", err);
      });

    return () => {
      if (viewRef.current) {
        viewRef.current.container = null;
      }
    };
  }, []);

  return (
    <div className="bg-white border-2 border-blue-400 p-2 rounded-lg shadow-md">
      <div className="align-items-center">
        <div
          ref={mapRef}
          className="map-container"
          style={{ height: "400px" }}
        />
      </div>
    </div>
  );
};

export default EsriMap;
